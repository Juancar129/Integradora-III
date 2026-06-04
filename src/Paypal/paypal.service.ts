import { Injectable, HttpException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { OrdersService } from '../orders/orders.service';
import { CreatePaypalOrderDto } from './dto/create-paypal-order.dto';

@Injectable()
export class PaypalService {
  private accessToken?: string;
  private accessTokenExpiresAt?: number;
  private readonly logger = new Logger(PaypalService.name);

  constructor(
    private readonly http: HttpService,
    private readonly ordersService: OrdersService,
  ) {}

  private async generateAccessToken(): Promise<string> {
    try {
      const clientId = process.env.PAYPAL_CLIENT_ID;
      const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
      const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

      this.logger.log('Intentando obtener el Access Token de PayPal...');

      const response = await this.http.axiosRef.post(
        'https://api-m.sandbox.paypal.com/v1/oauth2/token',
        'grant_type=client_credentials',
        {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      this.accessToken = response.data.access_token;
      this.accessTokenExpiresAt = Date.now() + (response.data.expires_in - 60) * 1000;

      this.logger.log('Access Token obtenido con exito.');
      return this.accessToken!;
    } catch (error: any) {
      this.logger.error(
        'Error generando access token PayPal',
        error.response?.data || error.message,
      );
      throw new HttpException('Error generando access token PayPal', 500);
    }
  }

  private async getAccessToken(forceRefresh = false): Promise<string> {
    const tokenExpired =
      !this.accessTokenExpiresAt || Date.now() >= this.accessTokenExpiresAt;

    if (forceRefresh || !this.accessToken || tokenExpired) {
      return this.generateAccessToken();
    }

    return this.accessToken!;
  }

  async createOrder(
    userId: number,
    amount: string,
    orderDto: CreatePaypalOrderDto,
    hasRetried = false,
  ) {
    try {
      await this.ordersService.validateOrderItems(orderDto.items);

      const accessToken = await this.getAccessToken();

      const orderData = {
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: amount,
            },
          },
        ],
        application_context: {
          brand_name: 'Tu Tienda',
          landing_page: 'LOGIN',
          user_action: 'PAY_NOW',
          return_url: 'http://localhost:5173/paypal/success',
          cancel_url: 'http://localhost:5173/paypal/cancel',
        },
      };

      this.logger.log('Enviando orden a PayPal...');
      this.logger.debug(JSON.stringify(orderData, null, 2));

      const response = await this.http.axiosRef.post(
        'https://api-m.sandbox.paypal.com/v2/checkout/orders',
        orderData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.warn(
        'RESPUESTA COMPLETA DE PAYPAL:\n' + JSON.stringify(response.data, null, 2),
      );

      await this.ordersService.createPaypalPending(userId, response.data.id, orderDto);

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401 && !hasRetried) {
        this.logger.warn('Access Token expirado al crear orden. Reintentando...');
        await this.getAccessToken(true);
        return this.createOrder(userId, amount, orderDto, true);
      }

      this.logger.error(
        'Error creando orden PayPal',
        error.response?.data || error.message,
      );
      throw new HttpException('Error creando orden PayPal', 500);
    }
  }

  async captureOrder(orderId: string, userId: number, hasRetried = false) {
    try {
      const existingOrder = await this.ordersService.findPaypalOrder(userId, orderId);

      if (existingOrder?.status === 'COMPLETED') {
        return {
          id: orderId,
          status: 'COMPLETED',
          alreadyCaptured: true,
        };
      }

      const accessToken = await this.getAccessToken();

      const response = await this.http.axiosRef.post(
        `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`,
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      const paypalData = response.data;

      if (paypalData.status === 'COMPLETED') {
        const amount = parseFloat(
          paypalData.purchase_units[0].payments.captures[0].amount.value,
        );

        const shipping = paypalData.purchase_units[0].shipping;
        const recipientName = shipping?.name?.full_name || null;
        const streetAddress = shipping?.address?.address_line_1 || null;
        const city = shipping?.address?.admin_area_2 || null;
        const postalCode = shipping?.address?.postal_code || null;
        const country = shipping?.address?.country_code || null;

        await this.ordersService.updatePaypalCapture(
          userId,
          paypalData.id,
          amount,
          paypalData.status,
          recipientName,
          streetAddress,
          city,
          postalCode,
          country,
        );
      }

      return paypalData;
    } catch (error: any) {
      if (error.response?.status === 401 && !hasRetried) {
        this.logger.warn('Access Token expirado al capturar orden. Reintentando...');
        await this.getAccessToken(true);
        return this.captureOrder(orderId, userId, true);
      }

      const issue = error.response?.data?.details?.[0]?.issue;

      if (error.response?.status === 422 && issue === 'ORDER_ALREADY_CAPTURED') {
        const existingOrder = await this.ordersService.findPaypalOrder(userId, orderId);

        if (existingOrder) {
          return {
            id: orderId,
            status: existingOrder.status,
            alreadyCaptured: true,
          };
        }
      }

      this.logger.error(
        'Error capturando orden PayPal',
        error.response?.data || error.message,
      );
      throw new HttpException('Error capturando orden PayPal', 500);
    }
  }
}
