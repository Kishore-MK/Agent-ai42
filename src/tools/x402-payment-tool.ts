import { tool } from "@langchain/core/tools";
import z from "zod/v3";
import { ServerPaymentClient } from "../utils/x402-payment.js";
import { createSigner } from "x402-fetch";
import * as dotenv from "dotenv";
import { json } from "zod";
dotenv.config();

export const makeX402PaymentTool = tool(
    async ({ url,content }: {
        url: string; 
        content?:string; 
      }) =>{
        try {
            const signer =await createSigner("solana-devnet",process.env.ED25519_PRIVATE_KEY || " ")
            const paymentClient = new ServerPaymentClient({network:'solana-devnet',signer})
           
          // Prepare payment request
          const response = await paymentClient.fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({message:content})
          });
          const data = await response.json();
            
          if (!response.ok) {
            return Error("Payment failed");
          }
  
          return {
            message: "Payment successful", 
            data: data
          };
        } catch (err: any) {
          return Error(err.message || "Payment failed");
        }
      },{
    name: "makeX402Payment",
    description: "Make a payment using x402 to the wersite or service that requires x402 payment",
    schema:  z.object({
        url: z.string().describe("The URL of the wersite or service that requires x402 payment") ,
        content: z.string().describe("Optional content sent in the body to the wersite or service that requires x402 payment") 
      }),
    },
)