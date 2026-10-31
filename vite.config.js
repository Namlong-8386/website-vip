import { defineConfig } from 'vite';
import { spawn } from 'node:child_process';

const PHP_PORT = 8090;

/**
 * Tự chạy PHP built-in server (api/router.php) cùng Vite,
 * rồi proxy mọi request /api/* sang đó.
 * Nhờ vậy chỉ cần `npm run dev` là có cả frontend lẫn API.
 */
function phpApiPlugin() {
  let proc = null;

  const startPhp = () => {
    if (proc) return;
    proc = spawn(
      'php',
      ['-S', `127.0.0.1:${PHP_PORT}`, '-t', '.', 'api/router.php'],
      { cwd: process.cwd(), stdio: 'inherit' }
    );
    proc.on('error', (err) => {
      console.error('[php-api] không chạy được PHP:', err.message);
      proc = null;
    });
    proc.on('exit', () => {
      proc = null;
    });
  };

  const stopPhp = () => {
    if (proc) {
      proc.kill();
      proc = null;
    }
  };

  // Chặn đọc trực tiếp thư mục dữ liệu qua Vite
  const blockData = (req, res, next) => {
    if (/^\/data(\/|$)/.test(req.url || '')) {
      res.statusCode = 403;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ ok: false, error: 'Forbidden' }));
      return;
    }
    next();
  };

  return {
    name: 'php-api',
    configureServer(server) {
      server.middlewares.use(blockData);
      startPhp();
      server.httpServer?.on('close', stopPhp);
      server.watcher.on('change', (file) => {
        if (file.includes('/api/')) server.ws.send({ type: 'full-reload' });
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use(blockData);
      startPhp();
      server.httpServer?.on('close', stopPhp);
    },
  };
}

export default defineConfig({
  plugins: [phpApiPlugin()],
  server: {
    proxy: {
      '/api': {
        target: `http://127.0.0.1:${PHP_PORT}`,
        changeOrigin: true,
      },
    },
  },
  preview: {
    proxy: {
      '/api': {
        target: `http://127.0.0.1:${PHP_PORT}`,
        changeOrigin: true,
      },
    },
  },
});
