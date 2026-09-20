import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import fs from 'fs'

function apiDevPlugin(): Plugin {
  return {
    name: 'api-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next();

        const urlObj = new URL(req.url, 'http://localhost');
        const endpoint = urlObj.pathname.replace(/^\/api\//, '').replace(/\/$/, '');
        const filePath = path.resolve(process.cwd(), 'api', `${endpoint}.js`);

        if (!fs.existsSync(filePath)) {
          return next();
        }

        let body: any = {};
        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method || '')) {
          const buffers = [];
          for await (const chunk of req) {
            buffers.push(chunk);
          }
          const raw = Buffer.concat(buffers).toString('utf-8');
          if (raw) {
            try {
              body = JSON.parse(raw);
            } catch {
              body = raw;
            }
          }
        }
        (req as any).body = body;
        (req as any).query = Object.fromEntries(urlObj.searchParams.entries());

        (res as any).status = function (code: number) {
          res.statusCode = code;
          return res;
        };
        (res as any).json = function (data: any) {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
          return res;
        };

        try {
          const mod = await server.ssrLoadModule(filePath);
          const handler = mod.default || mod;
          await handler(req, res);
        } catch (err: any) {
          console.error(`Error handling /api/${endpoint}:`, err);
          if (!res.writableEnded) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err?.message || 'Internal server error' }));
          }
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Populate process.env in Node so backend serverless handlers can access them
  Object.assign(process.env, env);

  const plugins = [react(), tailwindcss(), apiDevPlugin()];
  try {
    // @ts-ignore
    const m = await import('./.vite-source-tags.js');
    plugins.push(m.sourceTags());
  } catch {}

  const processEnvDefines: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    if (key.startsWith('VITE_') || key.startsWith('NEXT_PUBLIC_')) {
      processEnvDefines[`process.env.${key}`] = JSON.stringify(value);
    }
  }

  return {
    plugins,
    envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
    define: processEnvDefines,
  };
})
