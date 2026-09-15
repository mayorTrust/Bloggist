import { GoogleGenAI } from '@google/genai';

// Lazy initialization of Gemini client to prevent crashes if key is missing on startup
let aiClient = null;

function getAiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not configured.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

// Fallback high-resolution editorial placeholder images by theme
const CURATED_PLACEHOLDERS = [
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1400&auto=format&fit=crop&q=80', // Technology / Abstract Universe
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1400&auto=format&fit=crop&q=80', // Hardware / Chip / Silicon
  'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1400&auto=format&fit=crop&q=80', // Minimalist Workspace / Design
  'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1400&auto=format&fit=crop&q=80', // Editorial Notebook / Journal
  'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=1400&auto=format&fit=crop&q=80', // Clean Computing
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1400&auto=format&fit=crop&q=80'  // Cyber Matrix / Code
];

function getRandomPlaceholder() {
  const index = Math.floor(Math.random() * CURATED_PLACEHOLDERS.length);
  return CURATED_PLACEHOLDERS[index];
}

/**
 * Generate a slug from a title string
 */
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '') || 'untitled-article';
}

/**
 * Extract clean JSON string from model response text
 */
function extractJson(text) {
  if (!text) return null;
  // Try direct parse first
  try {
    return JSON.parse(text.trim());
  } catch (e) {}

  // Match ```json ... ``` block
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch && jsonMatch[1]) {
    try {
      return JSON.parse(jsonMatch[1].trim());
    } catch (e) {}
  }

  // Match first { ... } block
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(text.slice(firstBrace, lastBrace + 1));
    } catch (e) {}
  }

  return null;
}

/**
 * Conduct online research via Gemini with Google Search and generate full editorial article with images and SEO/AIO.
 */
export async function generateArticleFromVoice(topicDescription, options = {}) {
  const ai = getAiClient();
  const tone = options.tone || 'Editorial, analytical, deeply engaging and thoughtful';
  const targetLength = options.preferredLength || 'Comprehensive (800 - 1400 words)';

  const prompt = `
You are the lead editor, investigative researcher, and master essayist for "Bloggist", a prestigious minimalist digital publication known for high-craft journalism, technology foresight, philosophy, and cultural commentary.

The publication admin provided the following voice instructions/topic query:
"""
${topicDescription}
"""

YOUR TASK:
1. Conduct real-time online research via Google Search regarding this topic. Discover recent developments, verified facts, statistics, historical context, and contrasting perspectives.
2. Formulate a captivating, unforgettable editorial headline/title.
3. Write a sharp, punchy 1-2 sentence excerpt summarizing the core premise.
4. Search and select suitable royalty-free online imagery (Unsplash or verified public photo URLs). Include a primary high-resolution banner image and 1-2 inline contextual images integrated within the article body with responsive HTML figure tags, captions, and alt attributes. Use image error fallback handling: 'onerror="this.onerror=null;this.src=\\'${getRandomPlaceholder()}\\'"'.
5. Compose the full article content in clean, semantic HTML format:
   - Use <h2> and <h3> for structured sections.
   - Use <p> paragraphs with rich, varied sentence lengths.
   - Use <blockquote> for standout pull quotes.
   - Use <ul> or <ol> where appropriate.
   - Use <code> or <pre> if technical concepts are explained.
   - Embed the inline <figure><img src="..." alt="..." class="w-full h-auto my-6 border border-neutral-200" /><figcaption class="text-xs text-neutral-500 italic mt-1 text-center">Caption</figcaption></figure>.
6. Generate rigorous Search Engine Optimization (SEO) and Artificial Intelligence Optimization (AIO) data:
   - meta_title: 50-60 characters, compelling, keyword-rich.
   - meta_description: 140-160 characters, click-worthy summary.
   - keywords: Comma-separated list of 6-10 high-intent search keywords.
   - aio_summary: A structured summary specifically engineered for AI search engines (Perplexity, ChatGPT, Gemini, Copilot) containing:
     - A concise 2-sentence direct answer definition.
     - 4-5 bullet points of "Key Takeaways & Core Insights".
     - Author credibility context.
   - seo_score: An estimated integer rating from 85 to 98 based on content depth, structure, and keyword relevance.

OUTPUT FORMAT:
Return ONLY a valid, parseable JSON object matching this exact schema:
{
  "title": "Article Title Here",
  "slug": "kebab-case-slug-here",
  "author": "Trust Agbi",
  "excerpt": "A short, engaging 1-2 sentence summary of the article.",
  "banner_image": "https://images.unsplash.com/... (high quality banner photo URL)",
  "content_html": "<p>Article content starts here...</p><h2>Subheading</h2><p>...</p>",
  "meta_title": "SEO Title (50-60 chars)",
  "meta_description": "SEO Description (140-160 chars)",
  "keywords": "keyword1, keyword2, keyword3, keyword4",
  "aio_summary": "### Direct Answer\\n...\\n\\n### Key Takeaways\\n- Point 1\\n- Point 2\\n- Point 3\\n- Point 4",
  "seo_score": 94
}
`;

  try {
    // We use gemini-2.5-flash with googleSearch tool for real-time web research
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.7,
      }
    });

    const text = response.text || '';
    const parsed = extractJson(text);

    if (!parsed || !parsed.title || !parsed.content_html) {
      throw new Error('Gemini response could not be parsed into a complete article.');
    }

    // Ensure fallback banner image if missing or invalid
    if (!parsed.banner_image || !parsed.banner_image.startsWith('http')) {
      parsed.banner_image = getRandomPlaceholder();
    }

    // Ensure valid slug
    if (!parsed.slug) {
      parsed.slug = slugify(parsed.title);
    }

    // Default author
    if (!parsed.author) {
      parsed.author = 'Trust Agbi';
    }

    // Default SEO score
    if (!parsed.seo_score || isNaN(parsed.seo_score)) {
      parsed.seo_score = 92;
    }

    return parsed;
  } catch (err) {
    console.error('Gemini article generation error:', err);
    throw new Error(`AI Research & Generation failed: ${err.message || 'Unknown error'}`);
  }
}

/**
 * Optimize an existing or draft article for SEO and AIO
 */
export async function optimizeArticleForSeoAndAio(articleData) {
  const ai = getAiClient();
  const { title, excerpt, content_html, author } = articleData;

  const prompt = `
You are the world's foremost SEO and AIO (Artificial Intelligence Optimization) specialist for modern editorial publications.
Analyze the following article and generate optimal SEO metadata and AIO machine-readable knowledge structures:

Article Title: "${title || 'Untitled'}"
Excerpt: "${excerpt || ''}"
Author: "${author || 'Editorial Staff'}"
Content Excerpt/Body:
"""
${(content_html || '').replace(/<[^>]+>/g, ' ').slice(0, 3000)}
"""

YOUR TASK:
1. Formulate an optimized meta_title (50-60 characters) engineered for maximum search visibility and organic CTR.
2. Formulate an optimized meta_description (140-160 characters) providing a clear, engaging call-to-read without truncation.
3. Generate 8-12 high-intent, targeted search keywords (comma-separated).
4. Engineer a comprehensive AIO Summary (Direct Answer + Key Takeaways) designed for AI Search Engines (Perplexity, ChatGPT, Google AI Overviews, Claude) to parse, cite, and feature prominently. Format in Markdown with bullet points.
5. Provide an SEO & AIO Quality Score (integer between 80 and 99).
6. Provide 3 specific, actionable recommendations to improve the content further.

OUTPUT FORMAT:
Return ONLY a valid JSON object matching this schema:
{
  "meta_title": "Optimized SEO Title",
  "meta_description": "Optimized meta description under 160 characters.",
  "keywords": "keyword1, keyword2, keyword3, keyword4, keyword5",
  "aio_summary": "### Core Premise\\n...\\n\\n### Key Takeaways\\n- Insight 1\\n- Insight 2\\n- Insight 3\\n- Insight 4",
  "seo_score": 95,
  "optimization_tips": [
    "Tip 1",
    "Tip 2",
    "Tip 3"
  ]
}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.3,
      }
    });

    const text = response.text || '';
    const parsed = extractJson(text);

    if (!parsed || !parsed.meta_title) {
      // Fallback optimization if JSON parsing failed
      return {
        meta_title: `${title} | Bloggist`,
        meta_description: (excerpt || title || 'Read this article on Bloggist').slice(0, 155),
        keywords: 'editorial, essay, technology, design, bloggist',
        aio_summary: `### Key Takeaways\n- In-depth analysis of ${title}.\n- Explores modern perspectives, technology, and craft.\n- Authored for thoughtful, contemplative reading.`,
        seo_score: 90,
        optimization_tips: [
          'Add targeted heading structures with H2 and H3 tags.',
          'Include high-resolution descriptive imagery with alt tags.',
          'Provide clear concluding insights.'
        ]
      };
    }

    return parsed;
  } catch (err) {
    console.error('Gemini SEO/AIO optimization error:', err);
    throw new Error(`SEO/AIO Optimization failed: ${err.message || 'Unknown error'}`);
  }
}
