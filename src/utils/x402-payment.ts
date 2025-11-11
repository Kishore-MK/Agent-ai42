// src/server-payment.ts
import { wrapFetchWithPayment, createSigner, Signer } from 'x402-fetch'; 
import {  PaymentClient, PaymentClientConfig, PaymentInfo } from '../types.js';
 
 
interface ServerPaymentConfig extends PaymentClientConfig {
    signer: Signer;
  }

export abstract class BasePaymentClient implements PaymentClient {
  abstract fetch(url: string, options?: RequestInit): Promise<Response>;

  protected extractPaymentInfo(response: Response): PaymentInfo | null {
    const paymentHeader = response.headers.get('x-payment-response');
    
    if (!paymentHeader) {
      return null;
    }

    try {
      const decoded = JSON.parse(atob(paymentHeader));
      return {
        amount: decoded.amount,
        recipient: decoded.recipient,
        signature: decoded.signature,
        wallet: decoded.wallet,
      };
    } catch (error: any) {
      throw new Error(
        'PAYMENT_FAILED', 
        error
      );
    }
  }

  protected handleError(error: any, context: string): never {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error(
      'INTERNAL_ERROR',
      error
    );
  }
}

export class ServerPaymentClient extends BasePaymentClient {
  private fetchWithPayment!: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
  private initPromise: Promise<void>;

  constructor(config: ServerPaymentConfig) {
    super();
    
    if (!config.signer) {
      throw new Error(
        'PAYMENT_FAILED'
      );
    }

    this.initPromise = this.initialize(config);
  }

  private async initialize(config: ServerPaymentConfig): Promise<void> {
    try {
      this.fetchWithPayment = wrapFetchWithPayment(fetch, config.signer);
    } catch (error: any) {
      this.handleError(error, 'Failed to initialize server payment client');
    }
  }

  async fetch(url: string, options?: RequestInit): Promise<Response> {
    await this.initPromise;

    try {
      return await this.fetchWithPayment(url, options);
    } catch (error: any) {
      this.handleError(error, 'Server payment fetch failed');
    }
  }
}