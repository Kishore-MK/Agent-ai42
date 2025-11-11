import { Ed25519Keys, OrderInfo, ProductDetails } from "../types.js";
import {
    createEd25519Signature,
    generateUUID,
    parseUrlComponents,
  } from "../utils/crypto.js";
  import {
    completeCheckout,
    extractProductDetails,
  } from "../utils/playwright-agent.js";
  function getEd25519Keys(): Ed25519Keys {
    const privateKey = process.env.ED25519_PRIVATE_KEY;
    const publicKey = process.env.ED25519_PUBLIC_KEY;
    if (!privateKey || !publicKey) {
      throw new Error("ED25519_PRIVATE_KEY and ED25519_PUBLIC_KEY must be set");
    }
    return { privateKey, publicKey };
  }
  
  // Tool: Extract product details
  export async function toolExtractProduct(url: string,intentPDA:string): Promise<ProductDetails> {
    const keys = getEd25519Keys();
    const { authority, path } = parseUrlComponents(url);
  
    if (!authority || !path) {
      throw new Error("Invalid URL format");
    }
  
    const created = Math.floor(Date.now() / 1000);
    const expires = created + 8 * 60;
    const nonce = generateUUID();
  
    const { signatureInput, signature } = createEd25519Signature(
      authority,
      path,
      "primary-ed25519",
      nonce,
      created,
      expires,
      "agent-browser-auth",
      keys.privateKey,
      keys.publicKey
    );
  
    const headers = {
      "Signature-Input": signatureInput,
      Signature: signature,
      intentsignature:intentPDA
    };
  
    return await extractProductDetails(url, headers);
  }
  
  // Tool: Complete checkout
  export async function toolCompleteCheckout(
    productUrl: string,
  ): Promise<OrderInfo> {
    const keys = getEd25519Keys();
    const { authority, path, baseUrl } = parseUrlComponents(productUrl);
  
    const cartUrl =`${baseUrl}/cart`
     const checkoutUrl=`${baseUrl}/checkout`
    if (!authority || !path) {
      throw new Error("Invalid URL format");
    }
  
    const created = Math.floor(Date.now() / 1000);
    const expires = created + 8 * 60;
    const nonce = generateUUID();
  
    const { signatureInput, signature } = createEd25519Signature(
      authority,
      path,
      "primary-ed25519",
      nonce,
      created,
      expires,
      "agent-payer-auth",
      keys.privateKey,
      keys.publicKey
    );
  
    const headers = {
      "Signature-Input": signatureInput,
      Signature: signature,
    };
  
    return await completeCheckout(productUrl,cartUrl ,checkoutUrl , headers);
  }
   