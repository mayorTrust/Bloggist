import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './server/routes/api.js';
import { getDb } from './server/database/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize SQLite Database schema & seed data
  await getDb();

  // Basic middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // CORS headers and preflight handling
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-admin-token');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Expose /uploads directory publicly for stored images
  const uploadsPath = path.resolve(process.cwd(), 'server/uploads');
  app.use('/uploads', express.static(uploadsPath));

  // Mount API routes
  app.use('/api', apiRouter);

  // API error handler
  app.use('/api', (err, req, res, next) => {
    console.error('Unhandled API error:', err);
    res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', name: 'Bloggist API' });
  });

  // -------------------------------------------------------------
  // SEO & AIO (AI OVERVIEW & ENGINE OPTIMIZATION) DISCOVERY ENDPOINTS
  // -------------------------------------------------------------

  // 1. robots.txt
  app.get('/robots.txt', (req, res) => {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'bloggist.pub';
    const origin = `${protocol}://${host}`;

    const robotsTxt = `# Bloggist SEO & AIO Robots Directives
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/admin
Disallow: /api/auth

# AI Bot Directives (Allow for AI Search Engines & Overviews)
User-agent: Google-Extended
Allow: /

User-agent: GPTBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: CCBot
Allow: /

Sitemap: ${origin}/sitemap.xml
`;
    res.header('Content-Type', 'text/plain; charset=utf-8');
    res.send(robotsTxt);
  });

  // 2. sitemap.xml
  app.get('/sitemap.xml', async (req, res) => {
    try {
      const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
      const host = req.headers['x-forwarded-host'] || req.headers.host || 'bloggist.pub';
      const origin = `${protocol}://${host}`;

      const dbInstance = await getDb();
      const rawRes = dbInstance.exec("SELECT slug, updated_at, created_at FROM articles WHERE status = 'published' ORDER BY created_at DESC");
      let articles = [];
      if (rawRes && rawRes.length > 0) {
        const { columns, values } = rawRes[0];
        articles = values.map((row) => {
          const obj = {};
          columns.forEach((col, i) => { obj[col] = row[i]; });
          return obj;
        });
      }

      const today = new Date().toISOString().split('T')[0];

      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n`;

      // Static root pages
      xml += `  <url>\n    <loc>${origin}/</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
      xml += `  <url>\n    <loc>${origin}/about</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
      xml += `  <url>\n    <loc>${origin}/contact</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;

      // Dynamic published articles
      for (const art of articles) {
        const lastmod = (art.updated_at || art.created_at || today).split(' ')[0];
        xml += `  <url>\n    <loc>${origin}/blog/${encodeURIComponent(art.slug)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
      }

      xml += `</urlset>`;

      res.header('Content-Type', 'application/xml; charset=utf-8');
      res.send(xml);
    } catch (err) {
      console.error('Error generating sitemap.xml:', err);
      res.status(500).send('<error>Failed to generate sitemap</error>');
    }
  });

  // 3. llms.txt (Standard discovery file for AI search engines & LLMs)
  app.get(['/llms.txt', '/.well-known/llms.txt'], async (req, res) => {
    try {
      const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
      const host = req.headers['x-forwarded-host'] || req.headers.host || 'bloggist.pub';
      const origin = `${protocol}://${host}`;

      const dbInstance = await getDb();
      const rawRes = dbInstance.exec("SELECT title, slug, excerpt, author, category, aio_summary FROM articles WHERE status = 'published' ORDER BY created_at DESC");
      let articles = [];
      if (rawRes && rawRes.length > 0) {
        const { columns, values } = rawRes[0];
        articles = values.map((row) => {
          const obj = {};
          columns.forEach((col, i) => { obj[col] = row[i]; });
          return obj;
        });
      }

      let text = `# Bloggist\n\n`;
      text += `> A minimalist editorial blog platform focused on thoughtful perspectives, technology, design, and culture.\n\n`;
      text += `## Core Sections\n`;
      text += `- [Homepage](${origin}/): Curated essays, latest publications, and topic directory.\n`;
      text += `- [About Bloggist](${origin}/about): Editorial ethos, principles, and craft.\n`;
      text += `- [Contact Editorial](${origin}/contact): Letters to the editor and feedback.\n\n`;
      text += `## Published Articles\n\n`;

      for (const art of articles) {
        text += `### [${art.title}](${origin}/blog/${art.slug})\n`;
        text += `- **Category**: ${art.category || 'General'}\n`;
        text += `- **Author**: ${art.author || 'Trust Agbi'}\n`;
        text += `- **Summary**: ${art.excerpt || 'In-depth essay published on Bloggist.'}\n`;
        if (art.aio_summary) {
          text += `- **Direct Knowledge**: ${art.aio_summary.replace(/\n+/g, ' ')}\n`;
        }
        text += `\n`;
      }

      res.header('Content-Type', 'text/markdown; charset=utf-8');
      res.send(text);
    } catch (err) {
      console.error('Error generating llms.txt:', err);
      res.status(500).send('# Bloggist\nError generating index');
    }
  });

  // Vite integration: Development vs Production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Bloggist server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting Bloggist server:', err);
  process.exit(1);
});
