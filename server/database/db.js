import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';

const dbDir = path.resolve(process.cwd(), 'server/database');
const dbFile = path.join(dbDir, 'bloggist.sqlite');

let dbInstance = null;

// Helper to save DB binary buffer to disk
function saveDatabase() {
  if (!dbInstance) return;
  try {
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbFile, buffer);
  } catch (err) {
    console.error('Failed to save SQLite database:', err);
  }
}

// Convert sql.js query result into array of object rows
function queryToObjects(res) {
  if (!res || res.length === 0) return [];
  const { columns, values } = res[0];
  return values.map(row => {
    const obj = {};
    columns.forEach((col, i) => {
      obj[col] = row[i];
    });
    return obj;
  });
}

export async function getDb() {
  if (dbInstance) return dbInstance;

  const SQL = await initSqlJs();

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  if (fs.existsSync(dbFile)) {
    try {
      const fileBuffer = fs.readFileSync(dbFile);
      dbInstance = new SQL.Database(fileBuffer);
    } catch (e) {
      console.warn('Could not read existing database, creating fresh:', e);
      dbInstance = new SQL.Database();
    }
  } else {
    dbInstance = new SQL.Database();
  }

  // Initialize schema
  initSchema();
  // Seed sample articles if none exist
  seedInitialData();

  return dbInstance;
}

function initSchema() {
  dbInstance.run(`
    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      author TEXT NOT NULL,
      excerpt TEXT,
      banner_image TEXT,
      content_html TEXT NOT NULL,
      views INTEGER DEFAULT 0,
      status TEXT DEFAULT 'draft',
      meta_title TEXT,
      meta_description TEXT,
      keywords TEXT,
      aio_summary TEXT,
      seo_score INTEGER DEFAULT 88,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      article_id INTEGER NOT NULL,
      reaction_type TEXT NOT NULL,
      count INTEGER DEFAULT 0,
      UNIQUE(article_id, reaction_type)
    );

    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      article_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      reported INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      article_id INTEGER NOT NULL,
      reason TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      resolved INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Safe runtime column migration for existing SQLite databases
  const newCols = [
    { name: 'meta_title', type: 'TEXT' },
    { name: 'meta_description', type: 'TEXT' },
    { name: 'keywords', type: 'TEXT' },
    { name: 'aio_summary', type: 'TEXT' },
    { name: 'seo_score', type: 'INTEGER DEFAULT 88' }
  ];
  for (const col of newCols) {
    try {
      dbInstance.run(`ALTER TABLE articles ADD COLUMN ${col.name} ${col.type}`);
    } catch (colErr) {
      // Column exists, ignore
    }
  }

  saveDatabase();
}

function seedInitialData() {
  const initialArticles = [
    {
      title: "The Future of Technology",
      slug: "the-future-of-technology",
      author: "Trust Agbi",
      excerpt: "Exploring the silent convergence of distributed intelligence, ambient interfaces, and the return to calm, focused computing.",
      banner_image: "/uploads/future-tech.svg",
      content_html: `<h2>The Return to Calm Computing</h2>
<p>Over the past twenty years, the computing revolution has brought immense power into our pockets. Yet with that power came sensory saturation: relentless notification banners, algorithmic feeds demanding attention, and interfaces cluttered with decorative noise.</p>
<p>Today, a quiet shift is occurring. We are transitioning from noisy computing to calm computing—systems that inform without demanding, tools that empower deep human focus rather than fragmenting it.</p>
<div style="margin: 32px 0;"></div>
<h2>Ambient Intelligence Without Distraction</h2>
<p>The next era of technological architecture does not live inside flashy 3D headsets or neon dashboards. It lives in subtle, respectful interactions. When technology does its job with quiet precision, human creativity flourishes.</p>
<ul>
<li>Interfaces designed around whitespace and typography over visual clutter</li>
<li>Locally preserved user sovereignty and private, resilient data storage</li>
<li>Systems engineered for longevity, simplicity, and maintainability</li>
</ul>
<div style="margin: 32px 0;"></div>
<h2>The Craft of Simplicity</h2>
<p>Simplicity is not the absence of clutter; that's a consequence of simplicity. Simplicity is somehow essentially describing the purpose and place of an object and product.</p>
<p>As we build tools for 2026 and beyond, the highest mark of craftsmanship will remain restraint.</p>`,
      views: 1240,
      status: "published",
      created_at: "2026-09-15 08:30:00",
      reactions: { love: 84, laugh: 12, fire: 31, surprised: 7, sad: 2, clap: 24 },
      comments: [
        { name: "Eleanor Vance", content: "A refreshing perspective. The emphasis on calm interfaces and whitespace resonates deeply.", created_at: "2026-09-15 09:10:00" },
        { name: "Julian Thorne", content: "The quiet computing movement is long overdue. Excellent writing, Trust.", created_at: "2026-09-15 10:45:00" }
      ]
    },
    {
      title: "Understanding AI",
      slug: "understanding-ai",
      author: "Trust Agbi",
      excerpt: "Demystifying machine intelligence beyond marketing hype to uncover its genuine utility in everyday creative workflows.",
      banner_image: "/uploads/understanding-ai.svg",
      content_html: `<h2>Beyond the Hype Cycle</h2>
<p>Artificial intelligence is neither magical alchemy nor existential doom; it is statistical computation applied to human expression and structural logic.</p>
<p>When stripped of hyperbolic marketing adjectives, what remains is an exceptionally capable cognitive amplifier. It excels at synthesizing vast documentation, assisting in semantic discovery, and reducing mechanical friction in creative labor.</p>
<div style="margin: 24px 0;"></div>
<h2>The Human in the Loop</h2>
<p>The true value of intelligence tools is measured not by how much human involvement they displace, but by how thoughtfully they elevate human discernment.</p>
<ol>
<li>Clarity of purpose precedes effective prompt interaction</li>
<li>Rigorous critique and curation are more vital than raw generation speed</li>
<li>Domain understanding remains irreplaceable</li>
</ol>`,
      views: 3210,
      status: "published",
      created_at: "2026-09-12 14:00:00",
      reactions: { love: 142, laugh: 5, fire: 78, surprised: 19, sad: 1, clap: 95 },
      comments: [
        { name: "Marcus Chen", content: "Cognitive amplifier is the perfect descriptor. Great article.", created_at: "2026-09-13 11:20:00" }
      ]
    },
    {
      title: "Life in 2026",
      slug: "life-in-2026",
      author: "Trust Agbi",
      excerpt: "Reflections on modern rhythms, analog rituals, and finding balance in an interconnected world.",
      banner_image: "/uploads/life-in-2026.svg",
      content_html: `<h2>A New Cadence</h2>
<p>In 2026, the novelty of being perpetually connected has largely faded into the background. In its place is a deliberate revival of analog rituals: printed books, morning walks without podcasts, and pen-and-paper journaling.</p>
<p>We are learning that high tech and high touch are not opposites; they are balancing counterweights in a well-considered life.</p>`,
      views: 2890,
      status: "published",
      created_at: "2026-09-10 11:15:00",
      reactions: { love: 98, laugh: 14, fire: 45, surprised: 11, sad: 3, clap: 62 },
      comments: []
    }
  ];

  for (const art of initialArticles) {
    const check = dbInstance.exec("SELECT id FROM articles WHERE slug = '" + art.slug + "'");
    if (check && check.length > 0 && check[0].values && check[0].values.length > 0) {
      continue;
    }

    console.log(`Seeding missing editorial article: ${art.title}`);
    dbInstance.run(
      `INSERT INTO articles (title, slug, author, excerpt, banner_image, content_html, views, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [art.title, art.slug, art.author, art.excerpt, art.banner_image, art.content_html, art.views, art.status, art.created_at, art.created_at]
    );

    const artIdRes = dbInstance.exec("SELECT last_insert_rowid() as id");
    const artId = artIdRes[0].values[0][0];

    // Seed reactions
    for (const [rtype, rcount] of Object.entries(art.reactions)) {
      dbInstance.run(
        `INSERT INTO reactions (article_id, reaction_type, count) VALUES (?, ?, ?)`,
        [artId, rtype, rcount]
      );
    }

    // Seed comments
    for (const c of art.comments) {
      dbInstance.run(
        `INSERT INTO comments (article_id, name, content, created_at) VALUES (?, ?, ?, ?)`,
        [artId, c.name, c.content, c.created_at]
      );
    }
  }

  saveDatabase();
}

// Database helper methods
export const db = {
  async all(sql, params = []) {
    const instance = await getDb();
    const res = instance.exec(sql, params);
    return queryToObjects(res);
  },

  async get(sql, params = []) {
    const instance = await getDb();
    const res = instance.exec(sql, params);
    const rows = queryToObjects(res);
    return rows[0] || null;
  },

  async run(sql, params = []) {
    const instance = await getDb();
    instance.run(sql, params);
    let lastInsertRowid = 0;
    try {
      const idRes = instance.exec("SELECT last_insert_rowid()");
      if (idRes && idRes.length > 0 && idRes[0].values && idRes[0].values.length > 0) {
        lastInsertRowid = idRes[0].values[0][0] || 0;
      }
    } catch (e) {
      console.warn('Could not retrieve last_insert_rowid:', e);
    }
    saveDatabase();
    return { lastInsertRowid };
  }
};
