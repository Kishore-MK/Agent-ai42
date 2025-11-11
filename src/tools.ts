import {
  createEd25519Signature,
  generateUUID,
  parseUrlComponents,
} from "./utils/crypto.js";
import {
  completeCheckout,
  extractProductDetails,
} from "./utils/playwright-agent.js";
import { Ed25519Keys, OrderInfo, ProductDetails } from "./types.js";
import * as dotenv from "dotenv";
import z from "zod";
import { tool } from "ai";
dotenv.config()
// Define tools for Gemini
export const tools = {
    extract_product_details: tool({
      description: 'Extract product details from a merchant URL using authenticated browser automation',
      inputSchema: z.object({
        url: z.string().describe('The product URL to extract details from')
      }),
      execute: async ({ url }: { url: string }) => {
        return await toolExtractProduct(url);
      }
    }),
    complete_checkout: tool({
      description: 'Complete a purchase checkout process with TAP authentication',
      inputSchema: z.object({
        productUrl: z.string().describe('The product page URL')
      }),
      execute: async ({ productUrl }: { 
        productUrl: string;  
      }) => {
        return await toolCompleteCheckout(productUrl);
      }
    })
  };

function getEd25519Keys(): Ed25519Keys {
  const privateKey = process.env.ED25519_PRIVATE_KEY;
  const publicKey = process.env.ED25519_PUBLIC_KEY;
  if (!privateKey || !publicKey) {
    throw new Error("ED25519_PRIVATE_KEY and ED25519_PUBLIC_KEY must be set");
  }
  return { privateKey, publicKey };
}

// Tool: Extract product details
export async function toolExtractProduct(url: string): Promise<ProductDetails> {
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

   console.log("-----------------------------------------------------"),cartUrl;
   
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
