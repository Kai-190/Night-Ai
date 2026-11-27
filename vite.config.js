import { defineConfig } from 'vite';
import { loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import chatHandler from './api/chat.js';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  if (!process.env.OPENAI_API_KEY && env.OPENAI_API_KEY) {
    process.env.OPENAI_API_KEY = env.OPENAI_API_KEY;
  }
  if (!process.env.OPENAI_MODEL && env.OPENAI_MODEL) {
    process.env.OPENAI_MODEL = env.OPENAI_MODEL;
  }

  return {
    plugins: [
      react(),
      {
        name: 'night-ai-local-chat-api',
        configureServer(server) {
          server.middlewares.use('/api/chat', (req, res, next) => {
            Promise.resolve(chatHandler(req, res)).catch(next);
          });
        }
      }
    ],
    // Vercel hosts the app at the domain root.
    base: '/'
  };
});
