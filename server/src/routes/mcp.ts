import { Router } from 'express';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { authenticate } from '../middleware/apiAuth.js';
import { createMcpServer } from '../mcp/createMcpServer.js';

export const mcpRouter = Router();
mcpRouter.use(authenticate);

const JSON_RPC_METHOD_NOT_ALLOWED = {
  jsonrpc: '2.0' as const,
  error: { code: -32000, message: 'Method not allowed. Use POST.' },
  id: null,
};

mcpRouter.post('/', async (req, res) => {
  try {
    const server = createMcpServer(req.userId!, req.authMethod, req.apiKeyId);
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    res.on('close', () => {
      transport.close();
      server.close();
    });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.status(500).json({ jsonrpc: '2.0', error: { code: -32603, message: 'Internal server error' }, id: null });
    }
  }
});

mcpRouter.get('/', (_req, res) => {
  res.status(405).json(JSON_RPC_METHOD_NOT_ALLOWED);
});

mcpRouter.delete('/', (_req, res) => {
  res.status(405).json(JSON_RPC_METHOD_NOT_ALLOWED);
});
