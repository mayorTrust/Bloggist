import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db } from '../database/db.js';
import { createSessionToken, destroySessionToken, isValidSession, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Setup Multer for local image uploads in server/uploads
const uploadsDir = path.resolve(process.cwd(), 'server/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 20) || 'upload';
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${cleanName}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, WEBP, GIF, and SVG images are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Helper to generate a clean URL slug from title
function generateSlug(title) {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || `article-${Date.now()}`;
}

// -------------------------------------------------------------
// 1. AUTHENTICATION ROUTES
// -------------------------------------------------------------

router.post('/auth/login', (req, res) => {
  const { pin } = req.body;
  const configuredPin = (process.env.ADMIN_PIN || '1234').trim();

  if (!pin || String(pin).trim() !== configuredPin) {
    return res.status(401).json({ error: 'Incorrect PIN. Access denied.' });
  }

  const token = createSessionToken();
  return res.json({
    authenticated: true,
    token,
    message: 'Authentication successful'
  });
});

router.post('/auth/logout', (req, res) => {
  const authHeader = req.headers['authorization'];
  const customHeader = req.headers['x-admin-token'];
  let token = customHeader;
  if (!token && authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  destroySessionToken(token);
  return res.json({ message: 'Logged out successfully' });
});

router.get('/auth/me', (req, res) => {
  const authHeader = req.headers['authorization'];
  const customHeader = req.headers['x-admin-token'];
  let token = customHeader;
  if (!token && authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  const authenticated = isValidSession(token);
  return res.json({ authenticated });
});

// -------------------------------------------------------------
// 2. IMAGE UPLOAD ROUTE (Admin only)
// -------------------------------------------------------------

router.post('/uploads', requireAdmin, (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'Image upload failed' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    const publicUrl = `/uploads/${req.file.filename}`;
    return res.json({
      url: publicUrl,
      filename: req.file.filename
    });
  });
});

// -------------------------------------------------------------
// 3. ARTICLES ROUTES
// -------------------------------------------------------------

// GET /api/articles - List articles (public or admin)
router.get('/articles', async (req, res) => {
  try {
    const { status, search, limit } = req.query;
    let sql = 'SELECT * FROM articles WHERE 1=1';
    const params = [];

    // Filter by status (public view only sees 'published', admin can request all or specific)
    if (status && status !== 'all') {
      sql += ' AND status = ?';
      params.push(status);
    } else if (!status) {
      sql += " AND status = 'published'";
    }

    if (search && search.trim()) {
      sql += ' AND (title LIKE ? OR excerpt LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term);
    }

    sql += ' ORDER BY created_at DESC';

    if (limit && parseInt(limit, 10) > 0) {
      sql += ` LIMIT ${parseInt(limit, 10)}`;
    }

    const articles = await db.all(sql, params);

    // Attach reaction counts and comment counts to each article
    for (const article of articles) {
      const reactions = await db.all('SELECT reaction_type, count FROM reactions WHERE article_id = ?', [article.id]);
      const reactionMap = { love: 0, laugh: 0, fire: 0, surprised: 0, sad: 0, clap: 0 };
      reactions.forEach(r => {
        reactionMap[r.reaction_type] = r.count;
      });
      article.reactions = reactionMap;
      article.total_reactions = Object.values(reactionMap).reduce((a, b) => a + b, 0);

      const commentCountRes = await db.get('SELECT COUNT(*) as count FROM comments WHERE article_id = ?', [article.id]);
      article.comments_count = commentCountRes ? commentCountRes.count : 0;
    }

    return res.json(articles);
  } catch (err) {
    console.error('Error fetching articles:', err);
    return res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// GET /api/articles/:slugOrId - Single article with details, reactions, comments, recommendations
router.get('/articles/:slugOrId', async (req, res) => {
  try {
    const { slugOrId } = req.params;
    const isNumeric = /^\d+$/.test(slugOrId);

    let article = null;
    if (isNumeric) {
      article = await db.get('SELECT * FROM articles WHERE id = ?', [parseInt(slugOrId, 10)]);
    }
    if (!article) {
      article = await db.get('SELECT * FROM articles WHERE slug = ?', [slugOrId]);
    }

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Fetch reactions
    const reactions = await db.all('SELECT reaction_type, count FROM reactions WHERE article_id = ?', [article.id]);
    const reactionMap = { love: 0, laugh: 0, fire: 0, surprised: 0, sad: 0, clap: 0 };
    reactions.forEach(r => {
      reactionMap[r.reaction_type] = r.count;
    });
    article.reactions = reactionMap;

    // Fetch comments
    const comments = await db.all(
      'SELECT id, name, content, created_at FROM comments WHERE article_id = ? ORDER BY created_at DESC',
      [article.id]
    );
    article.comments = comments;

    // Fetch recommended articles (up to 3 other published articles)
    const recommended = await db.all(
      "SELECT id, title, slug, author, excerpt, banner_image, views, created_at FROM articles WHERE status = 'published' AND id != ? ORDER BY created_at DESC LIMIT 3",
      [article.id]
    );
    article.recommended = recommended;

    return res.json(article);
  } catch (err) {
    console.error('Error fetching single article:', err);
    return res.status(500).json({ error: 'Failed to fetch article' });
  }
});

// POST /api/articles/:id/view - Increment view count
router.post('/articles/:id/view', async (req, res) => {
  try {
    const { id } = req.params;
    const article = await db.get('SELECT id, views FROM articles WHERE id = ?', [id]);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const newViews = (article.views || 0) + 1;
    await db.run('UPDATE articles SET views = ? WHERE id = ?', [newViews, id]);

    return res.json({ views: newViews });
  } catch (err) {
    console.error('Error incrementing view count:', err);
    return res.status(500).json({ error: 'Failed to record view' });
  }
});

// POST /api/articles - Create article (Admin only)
router.post('/articles', requireAdmin, async (req, res) => {
  try {
    const { title, author, excerpt, banner_image, content_html, status } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Article title is required' });
    }
    if (!author || !author.trim()) {
      return res.status(400).json({ error: 'Author is required' });
    }
    if (!content_html || !content_html.trim()) {
      return res.status(400).json({ error: 'Article content cannot be empty' });
    }

    let slug = generateSlug(title);

    // Check slug collision
    const existingSlug = await db.get('SELECT id FROM articles WHERE slug = ?', [slug]);
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const cleanStatus = status === 'draft' ? 'draft' : 'published';
    const now = new Date().toISOString();

    // Auto-generate excerpt if not supplied
    let cleanExcerpt = excerpt ? excerpt.trim() : '';
    if (!cleanExcerpt) {
      const stripped = content_html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      cleanExcerpt = stripped.slice(0, 160) + (stripped.length > 160 ? '...' : '');
    }

    const result = await db.run(
      `INSERT INTO articles (title, slug, author, excerpt, banner_image, content_html, views, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?)`,
      [
        title.trim(),
        slug,
        author.trim(),
        cleanExcerpt,
        banner_image || '',
        content_html,
        cleanStatus,
        now,
        now
      ]
    );

    // Initialize reaction counters
    const reactionTypes = ['love', 'laugh', 'fire', 'surprised', 'sad', 'clap'];
    for (const rtype of reactionTypes) {
      await db.run(
        `INSERT INTO reactions (article_id, reaction_type, count) VALUES (?, ?, 0)`,
        [result.lastInsertRowid, rtype]
      );
    }

    const created = await db.get('SELECT * FROM articles WHERE id = ?', [result.lastInsertRowid]);
    return res.status(201).json(created);
  } catch (err) {
    console.error('Error creating article:', err);
    return res.status(500).json({ error: 'Failed to create article' });
  }
});

// PUT /api/articles/:id - Update article (Admin only)
router.put('/articles/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, excerpt, banner_image, content_html, status } = req.body;

    const existing = await db.get('SELECT * FROM articles WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Article not found' });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Article title is required' });
    }

    // If title changed, update slug safely
    let slug = existing.slug;
    if (title.trim() !== existing.title) {
      slug = generateSlug(title);
      const duplicate = await db.get('SELECT id FROM articles WHERE slug = ? AND id != ?', [slug, id]);
      if (duplicate) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
      }
    }

    let cleanExcerpt = excerpt !== undefined ? excerpt.trim() : existing.excerpt;
    if (!cleanExcerpt && content_html) {
      const stripped = content_html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      cleanExcerpt = stripped.slice(0, 160) + (stripped.length > 160 ? '...' : '');
    }

    const now = new Date().toISOString();

    await db.run(
      `UPDATE articles SET
        title = ?,
        slug = ?,
        author = ?,
        excerpt = ?,
        banner_image = ?,
        content_html = ?,
        status = ?,
        updated_at = ?
       WHERE id = ?`,
      [
        title.trim(),
        slug,
        (author || existing.author).trim(),
        cleanExcerpt,
        banner_image !== undefined ? banner_image : existing.banner_image,
        content_html !== undefined ? content_html : existing.content_html,
        status || existing.status,
        now,
        id
      ]
    );

    const updated = await db.get('SELECT * FROM articles WHERE id = ?', [id]);
    return res.json(updated);
  } catch (err) {
    console.error('Error updating article:', err);
    return res.status(500).json({ error: 'Failed to update article' });
  }
});

// DELETE /api/articles/:id - Delete article, comments, reactions, reports, and local images
router.delete('/articles/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const article = await db.get('SELECT * FROM articles WHERE id = ?', [id]);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Find locally uploaded images in banner or content to clean up if not used elsewhere
    const imagesToDelete = [];
    if (article.banner_image && article.banner_image.startsWith('/uploads/')) {
      imagesToDelete.push(article.banner_image.replace('/uploads/', ''));
    }

    const contentMatches = article.content_html.match(/\/uploads\/[a-zA-Z0-9._-]+/g) || [];
    for (const match of contentMatches) {
      imagesToDelete.push(match.replace('/uploads/', ''));
    }

    // Delete records from database
    await db.run('DELETE FROM comments WHERE article_id = ?', [id]);
    await db.run('DELETE FROM reactions WHERE article_id = ?', [id]);
    await db.run('DELETE FROM reports WHERE article_id = ?', [id]);
    await db.run('DELETE FROM articles WHERE id = ?', [id]);

    // Cleanup images from disk (only if they aren't default seed images)
    for (const filename of imagesToDelete) {
      const isDefault = ['future-tech.svg', 'understanding-ai.svg', 'life-in-2026.svg'].includes(filename);
      if (!isDefault) {
        const filePath = path.join(uploadsDir, filename);
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (e) {
            console.warn('Could not remove file:', filePath, e);
          }
        }
      }
    }

    return res.json({ message: 'Article and related data deleted successfully' });
  } catch (err) {
    console.error('Error deleting article:', err);
    return res.status(500).json({ error: 'Failed to delete article' });
  }
});

// -------------------------------------------------------------
// 4. REACTIONS ROUTES
// -------------------------------------------------------------

router.get('/articles/:id/reactions', async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await db.all('SELECT reaction_type, count FROM reactions WHERE article_id = ?', [id]);
    const map = { love: 0, laugh: 0, fire: 0, surprised: 0, sad: 0, clap: 0 };
    rows.forEach(r => {
      map[r.reaction_type] = r.count;
    });
    return res.json(map);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch reactions' });
  }
});

router.post('/articles/:id/reactions', async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body;
    const validTypes = ['love', 'laugh', 'fire', 'surprised', 'sad', 'clap'];

    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid reaction type' });
    }

    const existing = await db.get(
      'SELECT id, count FROM reactions WHERE article_id = ? AND reaction_type = ?',
      [id, type]
    );

    if (existing) {
      await db.run('UPDATE reactions SET count = count + 1 WHERE id = ?', [existing.id]);
    } else {
      await db.run('INSERT INTO reactions (article_id, reaction_type, count) VALUES (?, ?, 1)', [id, type]);
    }

    const rows = await db.all('SELECT reaction_type, count FROM reactions WHERE article_id = ?', [id]);
    const map = { love: 0, laugh: 0, fire: 0, surprised: 0, sad: 0, clap: 0 };
    rows.forEach(r => {
      map[r.reaction_type] = r.count;
    });

    return res.json(map);
  } catch (err) {
    console.error('Error saving reaction:', err);
    return res.status(500).json({ error: 'Failed to save reaction' });
  }
});

// -------------------------------------------------------------
// 5. COMMENTS ROUTES
// -------------------------------------------------------------

router.get('/articles/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const comments = await db.all(
      'SELECT id, name, content, created_at FROM comments WHERE article_id = ? ORDER BY created_at DESC',
      [id]
    );
    return res.json(comments);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

router.post('/articles/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, content } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment cannot be empty' });
    }

    const cleanName = name.trim().slice(0, 60);
    const cleanContent = content.trim().slice(0, 1000);
    const now = new Date().toISOString();

    const result = await db.run(
      'INSERT INTO comments (article_id, name, content, created_at) VALUES (?, ?, ?, ?)',
      [id, cleanName, cleanContent, now]
    );

    const created = await db.get('SELECT id, name, content, created_at FROM comments WHERE id = ?', [result.lastInsertRowid]);
    return res.status(201).json(created);
  } catch (err) {
    console.error('Error posting comment:', err);
    return res.status(500).json({ error: 'Failed to post comment' });
  }
});

// -------------------------------------------------------------
// 6. REPORTS ROUTES
// -------------------------------------------------------------

router.post('/articles/:id/report', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: 'Please provide a reason for the report' });
    }

    const cleanReason = reason.trim().slice(0, 500);
    const now = new Date().toISOString();

    await db.run(
      'INSERT INTO reports (article_id, reason, created_at, resolved) VALUES (?, ?, ?, 0)',
      [id, cleanReason, now]
    );

    return res.json({ message: 'Report submitted successfully' });
  } catch (err) {
    console.error('Error reporting article:', err);
    return res.status(500).json({ error: 'Failed to submit report' });
  }
});

router.get('/admin/reports', requireAdmin, async (req, res) => {
  try {
    const reports = await db.all(`
      SELECT r.id, r.article_id, r.reason, r.created_at, r.resolved, a.title as article_title, a.slug as article_slug
      FROM reports r
      LEFT JOIN articles a ON r.article_id = a.id
      ORDER BY r.created_at DESC
    `);
    return res.json(reports);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

router.post('/admin/reports/:id/resolve', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await db.run('UPDATE reports SET resolved = 1 WHERE id = ?', [id]);
    return res.json({ message: 'Report resolved' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to resolve report' });
  }
});

// -------------------------------------------------------------
// 7. CONTACT MESSAGES ROUTE
// -------------------------------------------------------------

router.post('/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (!email || !email.trim() || !email.includes('@')) {
      return res.status(400).json({ error: 'A valid email address is required' });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    const now = new Date().toISOString();
    await db.run(
      'INSERT INTO contact_messages (name, email, message, created_at) VALUES (?, ?, ?, ?)',
      [name.trim().slice(0, 100), email.trim().slice(0, 120), message.trim().slice(0, 2000), now]
    );

    return res.json({ message: 'Your message has been sent successfully.' });
  } catch (err) {
    console.error('Error saving contact message:', err);
    return res.status(500).json({ error: 'Failed to send message' });
  }
});

// -------------------------------------------------------------
// 8. ADMIN ANALYTICS ROUTE
// -------------------------------------------------------------

router.get('/admin/analytics', requireAdmin, async (req, res) => {
  try {
    // Total views
    const viewsRes = await db.get('SELECT SUM(views) as total_views FROM articles');
    const totalViews = viewsRes?.total_views || 0;

    // Total articles
    const articlesRes = await db.get('SELECT COUNT(*) as total_articles FROM articles');
    const totalArticles = articlesRes?.total_articles || 0;

    // Total comments
    const commentsRes = await db.get('SELECT COUNT(*) as total_comments FROM comments');
    const totalComments = commentsRes?.total_comments || 0;

    // Most viewed articles (top 5)
    const mostViewed = await db.all(
      'SELECT id, title, slug, views, author, status FROM articles ORDER BY views DESC LIMIT 5'
    );

    // Recent comments (last 5)
    const recentComments = await db.all(`
      SELECT c.id, c.name, c.content, c.created_at, a.title as article_title, a.slug as article_slug
      FROM comments c
      LEFT JOIN articles a ON c.article_id = a.id
      ORDER BY c.created_at DESC
      LIMIT 5
    `);

    // Reports summary
    const reports = await db.all(`
      SELECT r.id, r.article_id, r.reason, r.created_at, r.resolved, a.title as article_title
      FROM reports r
      LEFT JOIN articles a ON r.article_id = a.id
      WHERE r.resolved = 0
      ORDER BY r.created_at DESC
    `);

    return res.json({
      totalViews,
      totalArticles,
      totalComments,
      mostViewed,
      recentComments,
      reports
    });
  } catch (err) {
    console.error('Error generating analytics:', err);
    return res.status(500).json({ error: 'Failed to load analytics' });
  }
});

export default router;
