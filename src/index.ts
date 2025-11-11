import * as readline from "readline";
import * as dotenv from "dotenv";
import { google } from "@ai-sdk/google"
import {
  createEd25519Signature,
  parseUrlComponents,
  generateUUID,
} from "./utils/crypto.js";
import {
  extractProductDetails,
  completeCheckout,
} from "./utils/playwright-agent.js";
import { Ed25519Keys, ProductDetails, OrderInfo } from "./types.js";
import { toolCompleteCheckout, toolExtractProduct, tools } from "./tools.js";
import { generateText } from "ai";

dotenv.config();

 
async function runAgent() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_GENERATIVE_AI_API_KEY must be set');
  }

  const model = google('gemini-2.5-flash');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('🤖 TAP Agent with Gemini (AI SDK)');
  console.log('Type your commands (e.g., "Check product at URL" or "Buy this product")');
  console.log('Type "exit" to quit\n');

  const prompt = (query: string): Promise<string> => {
    return new Promise(resolve => rl.question(query, resolve));
  };

  const conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [];

  while (true) {
    const userInput = await prompt('You: ');
    
    if (userInput.toLowerCase() === 'exit') {
      console.log('Goodbye! 👋');
      rl.close();
      break;
    }

    try {
      conversationHistory.push({ role: 'user', content: userInput });

      const result = await generateText({
        model,
        messages: conversationHistory,
        tools:tools, 
      });

      if (result.toolResults && result.toolResults.length > 0) {
        const toolOutput = result.toolResults[0].output;
      
        conversationHistory.push({
          role: 'assistant',
          content: JSON.stringify(toolOutput),
        });
      
        const followUp = await generateText({
          model,
          messages: [
            ...conversationHistory,
            { role: 'user', content: 'Show the extracted product details nicely.' },
          ],
        });

        console.log(`\nTool Agent: ${followUp.text}\n`);
      }
      else{
      const responseText = result.text;
      conversationHistory.push({ role: 'assistant', content: responseText });

      console.log(`\nNormal Agent: ${responseText}\n`);
      }
    } catch (error: any) {
      console.error(`\n❌ Error: ${error.message}\n`);
    }
  }
}

// Start the agent
runAgent().catch(console.error);