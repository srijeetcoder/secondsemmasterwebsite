import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const searchGoogle = searchParams.get('google') === 'true';

    if (!query.trim()) {
      return NextResponse.json({ success: true, results: [], aiOverview: '' });
    }

    // 1. Build search query
    let searchQuery = query;
    if (!searchGoogle) {
      // Restrict search to the four notes domains
      searchQuery = `site:cnotesbycsrijeet.vercel.app OR site:chem-notes-nhm8.vercel.app OR site:pracchem.vercel.app OR site:mathsnotesbysrijeet.vercel.app ${query}`;
    }

    // 2. Fetch search results from DuckDuckGo HTML
    const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(searchQuery)}`;
    const searchRes = await fetch(ddgUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!searchRes.ok) {
      throw new Error(`Failed to fetch search results: ${searchRes.statusText}`);
    }

    const html = await searchRes.text();
    const searchResults: { title: string; link: string; snippet: string }[] = [];

    // Parse DDG HTML results using Regex
    const resultBlockRegex = /<div class="result[^"]*">([\s\S]*?)<\/div>\s*<\/div>/gi;
    let match;
    while ((match = resultBlockRegex.exec(html)) !== null && searchResults.length < 8) {
      const block = match[1];
      const titleRegex = /<a class="result__a"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/i;
      const snippetRegex = /<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/i;

      const titleMatch = titleRegex.exec(block);
      const snippetMatch = snippetRegex.exec(block);

      if (titleMatch) {
        let url = titleMatch[1];
        if (url.includes('uddg=')) {
          const parts = url.split('uddg=');
          if (parts[1]) {
            url = decodeURIComponent(parts[1].split('&')[0]);
          }
        }

        const title = titleMatch[2].replace(/<[^>]*>/g, '').trim();
        const snippet = snippetMatch ? snippetMatch[1].replace(/<[^>]*>/g, '').trim() : '';

        // Clean up title and snippet formatting
        searchResults.push({
          title: title.replace(/&amp;/g, '&'),
          link: url,
          snippet: snippet.replace(/&amp;/g, '&'),
        });
      }
    }

    // 3. Fetch Gemini AI Overview
    let aiOverview = '';
    const geminiKey = process.env.GEMINI_API_KEY;

    if (geminiKey) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
        const response = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are Google Gemini AI integrated into a Notes Hub website. Provide a clean, direct, and highly helpful AI Overview/Summary (maximum 3-4 bullet points or a short paragraph) in HTML format for the user's query: "${query}". Keep it relevant to engineering students if possible. Respond in clean HTML with bullet points (<ul> and <li>) and bold tags (<strong>). Do NOT wrap in markdown blocks like \`\`\`html.`
                  }
                ]
              }
            ]
          })
        });

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            aiOverview = text.trim();
          }
        }
      } catch (err) {
        console.error('[Gemini Search Error]:', err);
      }
    }

    // Fallback simulated AI Overview if Gemini API key is not configured yet
    if (!aiOverview) {
      aiOverview = getSimulatedOverview(query);
    }

    return NextResponse.json({ success: true, results: searchResults, aiOverview });

  } catch (err: any) {
    console.error('[Search API Error]:', err);
    return NextResponse.json({ success: false, error: err.message, results: [], aiOverview: '' });
  }
}

// A dictionary of highly matching, themed local responses for common terms
function getSimulatedOverview(query: string): string {
  const q = query.toLowerCase();
  
  if (q.includes('caa') || q.includes('citizenship')) {
    return `<ul>
      <li><strong>Definition:</strong> The Citizenship (Amendment) Act (CAA) is a law enacted by the Parliament of India in December 2019.</li>
      <li><strong>Purpose:</strong> It provides a path to Indian citizenship for persecuted religious minorities (Hindus, Sikhs, Buddhists, Jains, Parsis, and Christians) from Pakistan, Bangladesh, and Afghanistan who arrived in India before Dec 31, 2014.</li>
      <li><strong>Status:</strong> The rules for implementation were officially notified in March 2024.</li>
    </ul>`;
  }
  
  if (q.includes('titration') || q.includes('practical')) {
    return `<ul>
      <li><strong>Concept:</strong> Titration is a laboratory method of quantitative chemical analysis used to determine the concentration of an identified analyte.</li>
      <li><strong>Method:</strong> A reagent (the titrant) is prepared as a standard solution of known concentration and volume. It reacts with a solution of analyte to determine the concentration.</li>
      <li><strong>Key Indicators:</strong> Phenolphthalein (colorless to pink in base) and Methyl Orange (red to yellow) are commonly used to identify the equivalence endpoint.</li>
    </ul>`;
  }

  if (q.includes('matrix') || q.includes('linear algebra')) {
    return `<ul>
      <li><strong>Definition:</strong> A matrix is a rectangular array of numbers, symbols, or expressions arranged in rows and columns.</li>
      <li><strong>Linear Transformation:</strong> Matrices represent linear mappings and allow explicit computations in linear algebra.</li>
      <li><strong>Key Concepts:</strong> Determinants, Eigenvalues, Eigenvectors, and Matrix Inversion are fundamental for solving systems of linear differential equations.</li>
    </ul>`;
  }

  if (q.includes('c ') || q.includes('programming') || q.includes('loop')) {
    return `<ul>
      <li><strong>Definition:</strong> C is a general-purpose, procedural computer programming language supporting structured programming, lexical variable scope, and recursion.</li>
      <li><strong>Key Constructs:</strong> Pointers (direct memory addressing), Control Loops (for, while, do-while), and dynamic memory allocation (malloc/free).</li>
      <li><strong>Usage:</strong> System programming, operating system kernels, compilers, and embedded devices due to its close-to-hardware efficiency.</li>
    </ul>`;
  }

  // Default generic styled overview
  return `<p>AI Overview for <strong>"${query}"</strong>:</p>
  <ul>
    <li>This search was queried across the Notes Hub database.</li>
    <li>To get live generative responses powered by Google Gemini, please configure the <code>GEMINI_API_KEY</code> environment variable in your <code>.env.local</code> file.</li>
    <li>Explore matched subjects in the carousel below to read dedicated study materials, lecture summaries, and sample viva question sheets.</li>
  </ul>`;
}
