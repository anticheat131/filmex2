import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { proxyHandler } from './src/api/proxy-api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Proxy endpoint for audio (and other media)
app.get('/api/proxy', async (req, res) => {
  const { url, headers } = req.query;
  await proxyHandler(url, headers, res);
});

// Serve static files from Vite build (dist)
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback to index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
