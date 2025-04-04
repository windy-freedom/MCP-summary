#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ErrorCode,
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";

interface GenerateImageParams {
  model: string;
  prompt: string;
  negative_prompt?: string;
  image_size: string;
  batch_size: number;
  seed: number;
  num_inference_steps: number;
  guidance_scale: number;
  image?: string;
}

class SiliconFlowServer {
  private server: Server;
  private apiKey: string;
  private axiosInstance;

  constructor() {
    this.server = new Server(
      {
        name: "silicon-flow-server",
        version: "0.1.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.apiKey = process.env.SILICON_FLOW_API_KEY || "";
    if (!this.apiKey) {
      throw new Error("SILICON_FLOW_API_KEY environment variable is required");
    }

    this.axiosInstance = axios.create({
      baseURL: "https://api.siliconflow.cn/v1",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
    });

    this.setupToolHandlers();
    
    this.server.onerror = (error) => console.error("[MCP Error]", error);
    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "generate_image",
            description: "Generate an image using Silicon Flow API",
            inputSchema: {
              type: "object",
              properties: {
                model: {
                  type: "string",
                  description: "Model to use for generation (e.g. 'Kwai-Kolors/Kolors')"
                },
                prompt: {
                  type: "string",
                  description: "Text description of the image to generate"
                },
                negative_prompt: {
                  type: "string",
                  description: "Text description of what to avoid in the image"
                },
                image_size: {
                  type: "string",
                  description: "Size of the output image (e.g. '1024x1024')"
                },
                batch_size: {
                  type: "number",
                  description: "Number of images to generate"
                },
                seed: {
                  type: "number",
                  description: "Random seed for generation"
                },
                num_inference_steps: {
                  type: "number",
                  description: "Number of denoising steps"
                },
                guidance_scale: {
                  type: "number",
                  description: "Guidance scale for generation"
                }
              },
              required: ["model", "prompt", "image_size"]
            }
          }
        ]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      switch (request.params.name) {
        case "generate_image": {
          const args = request.params.arguments;
          if (!args || typeof args !== 'object') {
            throw new McpError(
              ErrorCode.InvalidParams,
              "Arguments must be an object"
            );
          }

          const params: GenerateImageParams = {
            model: (args.model as string) || "Kwai-Kolors/Kolors",
            prompt: args.prompt as string,
            image_size: (args.image_size as string) || "1024x1024",
            batch_size: (args.batch_size as number) || 1,
            seed: (args.seed as number) || 4999999999,
            num_inference_steps: (args.num_inference_steps as number) || 20,
            guidance_scale: (args.guidance_scale as number) || 7.5,
          };

          if (!params.prompt) {
            throw new McpError(
              ErrorCode.InvalidParams,
              "Prompt is required"
            );
          }

          if (args.negative_prompt) {
            params.negative_prompt = args.negative_prompt as string;
          }

          if (args.image) {
            params.image = args.image as string;
          }
          
          try {
            const response = await this.axiosInstance.post("/images/generations", {
              model: params.model || "Kwai-Kolors/Kolors",
              prompt: params.prompt,
              negative_prompt: params.negative_prompt,
              image_size: params.image_size || "1024x1024",
              batch_size: params.batch_size || 1,
              seed: params.seed || 4999999999,
              num_inference_steps: params.num_inference_steps || 20,
              guidance_scale: params.guidance_scale || 7.5,
              image: params.image
            });

            return {
              content: [{
                type: "text",
                text: JSON.stringify({
                  status: "success",
                  images: response.data.images,
                  timings: response.data.timings,
                  seed: response.data.seed
                }, null, 2)
              }]
            };
          } catch (error) {
            if (axios.isAxiosError(error)) {
              throw new McpError(
                ErrorCode.InternalError,
                `Silicon Flow API error: ${error.response?.data?.message || error.message}`
              );
            }
            throw error;
          }
        }

        default:
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${request.params.name}`
          );
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Silicon Flow MCP server running on stdio");
  }
}

const server = new SiliconFlowServer();
server.run().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
