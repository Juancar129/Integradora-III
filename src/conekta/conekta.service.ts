import { Injectable, Logger, HttpException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ConektaService {
  private readonly logger = new Logger(ConektaService.name);
  private readonly baseUrl = 'https://api.conekta.io';

  private getAuthHeader() {
    const key = process.env.CONEKTA_API_KEY;
    if (!key) throw new Error('CONEKTA_API_KEY no definida en variables de entorno');
    return { Authorization: `Bearer ${key}` };
  }

  async createOrder({ amount, currency = 'MXN', userId }: { amount: number; currency?: string; userId?: string; }) {
    try {
      const body = {
        currency,
        line_items: [
          {
            name: 'Pago desde aplicación',
            unit_price: Math.round(amount), // ajuste según si usas pesos o centavos
            quantity: 1
          }
        ],
        metadata: { userId: userId?.toString() || 'unknown' }
      };

      const res = await axios.post(`${this.baseUrl}/orders`, body, {
        headers: {
          ...this.getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });

      return res.data;
    } catch (error: any) {
      this.logger.error('Error creando orden en Conekta', error.response?.data || error.message);
      throw new HttpException('Error creando orden en Conekta', 500);
    }
  }

  async captureOrder(orderId: string) {
    if (!orderId) throw new Error('orderId requerido para captureOrder');
    try {
      const res = await axios.post(`${this.baseUrl}/orders/${orderId}/capture`, {}, {
        headers: {
          ...this.getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });
      return res.data;
    } catch (error: any) {
      this.logger.error('Error capturando orden en Conekta', error.response?.data || error.message);
      throw new HttpException('Error capturando orden en Conekta', 500);
    }
  }
}
