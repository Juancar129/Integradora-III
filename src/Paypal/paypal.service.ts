import { Injectable, HttpException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class PaypalService {
  private accessToken: string;
  private readonly logger = new Logger(PaypalService.name);

  constructor(
    private readonly http: HttpService,
    private readonly ordersService: OrdersService,
  ) {}

  async generateAccessToken(): Promise<string> {
    try {
      const clientId = process.env.PAYPAL_CLIENT_ID;
      const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
      const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

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
      return this.accessToken;
    } catch (error: any) {
      this.logger.error('Error generando access token PayPal', error.response?.data || error.message);
      throw new HttpException('Error generando access token PayPal', 500);
    }
  }

  async createOrder(amount: string) {
    try {
      if (!this.accessToken) await this.generateAccessToken();

      const orderData = {
        intent: 'CAPTURE',
        purchase_units: [
          { amount: { currency_code: 'USD', value: amount } },
        ],
      };

      const response = await this.http.axiosRef.post(
        'https://api-m.sandbox.paypal.com/v2/checkout/orders',
        orderData,
        { headers: { Authorization: `Bearer ${this.accessToken}` } },
      );

      return response.data;
    } catch (error: any) {
      this.logger.error('Error creando orden PayPal', error.response?.data || error.message);
      throw new HttpException('Error creando orden PayPal', 500);
    }
  }

  async captureOrder(orderId: string, userId: number) {
    try {
      if (!this.accessToken) await this.generateAccessToken();

      const response = await this.http.axiosRef.post(
        `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`,
        {},
        { headers: { Authorization: `Bearer ${this.accessToken}` } },
      );

      const paypalData = response.data;

      if (paypalData.status === 'COMPLETED') {
        const amount = parseFloat(
          paypalData.purchase_units[0].payments.captures[0].amount.value,
        );

        await this.ordersService.createFromPaypal(
          userId,
          paypalData.id,
          amount,
          paypalData.status,
        );
      }

      return paypalData;
    } catch (error: any) {
      this.logger.error('Error capturando orden PayPal', error.response?.data || error.message);
      throw new HttpException('Error capturando orden PayPal', 500);
    }
  }
}
