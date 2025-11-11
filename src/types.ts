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