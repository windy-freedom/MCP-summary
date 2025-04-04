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

const API_KEY = process.env.ISAPP_API_KEY;
if (!API_KEY) {
  throw new Error('ISAPP_API_KEY environment variable is required');
}

interface ReportParams {
  start_date: string;
  end_date: string;
  metrics?: string[];
  breakdowns?: string[];
}

class IsAppReportingServer {
  private server: Server;
  private axiosInstance;
  private baseURL = 'https://reporting.isappcloud.com/advertisers/v1';

  constructor() {
    this.server = new Server(
      {
        name: 'iron-source-API',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      headers: {
        Authorization: API_KEY,
      },
    });

    this.setupToolHandlers();
    
    // Error handling
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
          name: 'get_report',
          description: 'Get advertising report data from IronSource',
          inputSchema: {
            type: 'object',
            properties: {
              start_date: {
                type: 'string',
                description: 'Start date in YYYY-MM-DD format',
              },
              end_date: {
                type: 'string',
                description: 'End date in YYYY-MM-DD format',
              },
              metrics: {
                type: 'array',
                items: {
                  type: 'string',
                },
                description: 'Array of metrics (e.g. impressions, clicks, completions, launches, installs, spend)',
              },
              breakdowns: {
                type: 'array',
                items: {
                  type: 'string',
                },
                description: 'Array of breakdown dimensions (e.g. day, app_name, package_name, campaign_id, campaign_name)',
              },
            },
            required: ['start_date', 'end_date'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name !== 'get_report') {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${request.params.name}`
        );
      }

      const args = request.params.arguments as Record<string, unknown>;
      
      // Validate required parameters
      if (typeof args.start_date !== 'string' || typeof args.end_date !== 'string') {
        throw new McpError(
          ErrorCode.InvalidParams,
          'start_date and end_date must be strings in YYYY-MM-DD format'
        );
      }

      const params: ReportParams = {
        start_date: args.start_date,
        end_date: args.end_date,
        metrics: Array.isArray(args.metrics) ? args.metrics.map(String) : undefined,
        breakdowns: Array.isArray(args.breakdowns) ? args.breakdowns.map(String) : undefined,
      };
      
      try {
        const response = await this.axiosInstance.get('reports', {
          params: {
            start_date: params.start_date,
            end_date: params.end_date,
            metrics: params.metrics?.join(',') || 'impressions,clicks,completions,launches,installs,spend',
            breakdowns: params.breakdowns?.join(',') || 'day,app_name,package_name,campaign_id,campaign_name',
            format: 'csv',
          },
        });

        return {
          content: [
            {
              type: 'text',
              text: response.data,
            },
          ],
        };
      } catch (error) {
        if (axios.isAxiosError(error)) {
          return {
            content: [
              {
                type: 'text',
                text: `API Error: ${error.response?.data?.message || error.message}`,
              },
            ],
            isError: true,
          };
        }
        throw error;
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('IronSource API MCP server running on stdio');
  }
}

const server = new IsAppReportingServer();
server.run().catch(console.error);
