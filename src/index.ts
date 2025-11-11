import { StateGraph, MessagesAnnotation, START } from "@langchain/langgraph";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AIMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import * as dotenv from "dotenv";
import { recordIntentTool, tools } from "./tools.js";
import chalk from "chalk";
import ora from "ora";
import prompts from "prompts";
import boxen from "boxen";

dotenv.config();

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0,
}).bindTools(tools);

const memory = new MemorySaver();

// Custom tool node with intent recording
async function callToolsWithIntent(state: typeof MessagesAnnotation.State) {
  const lastMessage = state.messages[state.messages.length - 1] as AIMessage;
  const toolCalls = lastMessage.tool_calls || [];
  
  const toolMessages = [];
  
  for (const toolCall of toolCalls) {
    console.log(chalk.cyan(`\n🔒 Recording intent for: ${chalk.bold(toolCall.name)}`));
    
    const spinner = ora('Creating blockchain intent...').start();
    
    try {
      const intentResult = await recordIntentTool.invoke({
        agentPDA: "GJvsD7GG61VC8BMDVyefVEhQQp2o2pT8kZq4BCGeDx1W",
        maxAmount: 1000000,
        action: toolCall.name,
        expiresInSeconds: 3600
      });
      
      spinner.succeed(chalk.green(`Intent recorded: ${intentResult.intentPDA}`));
      const toolArgsWithIntent = { ...toolCall.args, intentPDA: intentResult.intentPDA };

      // Execute actual tool
      const toolSpinner = ora(`Executing ${toolCall.name}...`).start();
      const tool = tools.find(t => t.name === toolCall.name);
      
      if (tool) {
        const result = await tool.invoke(toolArgsWithIntent);
        toolSpinner.succeed(chalk.green(`${toolCall.name} completed`));
        
        toolMessages.push({
          role: "tool",
          content: JSON.stringify(result),
          tool_call_id: toolCall.id
        });
      }
    } catch (error: any) {
      spinner.fail(chalk.red(`Error: ${error.message}`));
      toolMessages.push({
        role: "tool",
        content: `Error: ${error.message}`,
        tool_call_id: toolCall.id
      });
    }
  }
  
  return { messages: toolMessages };
}

function shouldContinue(state: typeof MessagesAnnotation.State) {
  const lastMessage = state.messages[state.messages.length - 1] as AIMessage;
  return lastMessage.tool_calls?.length ? "tools" : "__end__";
}


const workflow = new StateGraph(MessagesAnnotation)
  .addNode("agent", async (state) => {
    const response = await model.invoke(state.messages);
    return { messages: [response] };
  })
  .addNode("tools", callToolsWithIntent)
  .addEdge(START, "agent")
  .addConditionalEdges("agent", shouldContinue)
  .addEdge("tools", "agent");

const agent = workflow.compile({ checkpointer: memory });

const config = {
  configurable: { thread_id: "conversation-1" }
};

// Display welcome banner
console.clear();
console.log(
  boxen(
    chalk.bold.cyan('🤖 AI42 Agent Chat\n') +
    chalk.gray('Your autonomous agent with verified intent trials powered by Trusted Agent Protocol\n') +
    chalk.yellow('Type your message or "exit" to quit'),
    {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'cyan'
    }
  )
);

async function chat() {
  const response = await prompts({
    type: 'text',
    name: 'input',
    message: chalk.bold.blue('You'),
    validate: (value:any) => value.length > 0 ? true : 'Please enter a message'
  });

  if (!response.input || response.input.toLowerCase() === 'exit' || response.input.toLowerCase() === 'quit') {
    console.log(
      boxen(chalk.green.bold('👋 Sayonara!'), {
        padding: 0.5,
        borderColor: 'green',
        borderStyle: 'round'
      })
    );
    process.exit(0);
  }

  const spinner = ora('Agent thinking...').start();

  try {
    const agentResponse = await agent.invoke(
      { messages: [{ role: "user", content: response.input }] },
      config
    );

    spinner.stop();

    const lastMessage = agentResponse.messages[agentResponse.messages.length - 1];
    
    console.log(
      boxen(
        chalk.bold.magenta('🤖 Agent\n\n') + chalk.white(lastMessage.content),
        {
          padding: 1,
          margin: { top: 1, bottom: 1 },
          borderStyle: 'round',
          borderColor: 'magenta'
        }
      )
    );

  } catch (error: any) {
    spinner.fail(chalk.red.bold('Error occurred'));
    console.log(chalk.red(`\n❌ ${error.message}\n`));
  }

  // Continue chat
  chat();
}

chat();