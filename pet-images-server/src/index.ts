#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';

class PetImagesServer {
  private server: Server;
  private dogApiBaseUrl = 'https://dog.ceo/api';
  private catApiBaseUrl = 'https://cataas.com';

  constructor() {
    this.server = new Server(
      {
        name: 'pet-image-get',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'get_random_pet',
          description: '获取随机的猫或狗图片',
          inputSchema: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: ['cat', 'dog', 'random'],
                description: '宠物类型: cat(猫), dog(狗), random(随机)',
              },
            },
          },
        },
        {
          name: 'get_dog_by_breed',
          description: '获取指定品种的狗狗图片',
          inputSchema: {
            type: 'object',
            properties: {
              breed: {
                type: 'string',
                description: '狗狗品种，例如: husky, pomeranian等',
              },
            },
            required: ['breed'],
          },
        },
        {
          name: 'list_dog_breeds',
          description: '列出所有可用的狗狗品种',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_cat_with_tag',
          description: '获取带有特定标签的猫咪图片',
          inputSchema: {
            type: 'object',
            properties: {
              tag: {
                type: 'string',
                description: '标签，例如: cute, sleeping等',
              },
            },
            required: ['tag'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        switch (request.params.name) {
          case 'get_random_pet': {
            const type = (request.params.arguments as any)?.type || 'random';
            if (type === 'random') {
              const choice = Math.random() < 0.5 ? 'cat' : 'dog';
              return await this.getRandomPet(choice);
            }
            return await this.getRandomPet(type);
          }

          case 'get_dog_by_breed': {
            const { breed } = request.params.arguments as { breed: string };
            if (!breed) {
              throw new McpError(ErrorCode.InvalidParams, '必须提供狗狗品种');
            }
            const response = await axios.get(`${this.dogApiBaseUrl}/breed/${breed}/images/random`);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    success: true,
                    imageUrl: response.data.message,
                  }),
                },
              ],
            };
          }

          case 'list_dog_breeds': {
            const response = await axios.get(`${this.dogApiBaseUrl}/breeds/list/all`);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    success: true,
                    breeds: Object.keys(response.data.message),
                  }),
                },
              ],
            };
          }

          case 'get_cat_with_tag': {
            const { tag } = request.params.arguments as { tag: string };
            if (!tag) {
              throw new McpError(ErrorCode.InvalidParams, '必须提供标签');
            }
            const response = await axios.get(`${this.catApiBaseUrl}/cat/${tag}?json=true`);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    success: true,
                    imageUrl: `${this.catApiBaseUrl}/cat/${response.data.id}`,
                  }),
                },
              ],
            };
          }

          default:
            throw new McpError(ErrorCode.MethodNotFound, `未知的工具: ${request.params.name}`);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new McpError(
            ErrorCode.InternalError,
            `API错误: ${error.response?.data?.message || error.message}`
          );
        }
        throw error;
      }
    });
  }

  private async getRandomPet(type: 'cat' | 'dog') {
    if (type === 'dog') {
      const response = await axios.get(`${this.dogApiBaseUrl}/breeds/image/random`);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              type: 'dog',
              imageUrl: response.data.message,
            }),
          },
        ],
      };
    } else {
      const response = await axios.get(`${this.catApiBaseUrl}/cat?json=true`);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              type: 'cat',
              imageUrl: `${this.catApiBaseUrl}/cat/${response.data.id}`,
            }),
          },
        ],
      };
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Pet Images MCP server running on stdio');
  }
}

const server = new PetImagesServer();
server.run().catch(console.error);
