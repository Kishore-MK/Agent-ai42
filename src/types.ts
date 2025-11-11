export interface SignatureData {
    authority: string;
    path: string;
    created: number;
    expires: number;
    keyId: string;
    nonce: string;
    tag: string;
  }
  
  export interface ProductDetails {
    title?: string;
    price?: string;
    url: string;
    extractionTime: string;
    extractionLog: string;
  }
  
  export interface OrderInfo {
    orderId?: string;
    successPageUrl?: string;
    timestamp: string;
    error?: string;
    finalUrl?: string;
  }
  
  export interface Ed25519Keys {
    privateKey: string;
    publicKey: string;
  }
 
 
// ============================================
// SDK Configuration Types
// ============================================

 
  
  export interface PaymentInfo {
    amount: number;
    recipient: string;
    signature: string;
    wallet: string;
  }
  
 



  // ============================================
// Payment Client Types
// ============================================

export interface PaymentClient {
  fetch(url: string, options?: RequestInit): Promise<Response>;
}

export interface PaymentClientConfig {
  network: 'solana-mainnet' | 'solana-devnet' | 'base-sepolia';
  maxPaymentAmount?: bigint;
}

 

export type ErrorCode = 
  | 'INVALID_REQUEST'
  | 'PAYMENT_REQUIRED'
  | 'PAYMENT_FAILED' 
  | 'INTERNAL_ERROR';