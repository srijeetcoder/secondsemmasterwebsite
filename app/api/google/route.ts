import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';

    if (!query.trim()) {
      return new Response('<p>No query provided</p>', {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    // Fetch the authentic Google search page in standard HTML mode
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&gbv=1&hl=en`;
    const res = await fetch(googleUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch Google page: ${res.statusText}`);
    }

    const html = await res.text();

    // Rewrite Google relative links and form submissions to pass through our proxy
    let cleanHtml = html
      .replace(/action="\/search"/g, 'action="/api/google"')
      .replace(/action="https:\/\/www\.google\.com\/search"/g, 'action="/api/google"')
      .replace(/href="\/search\?/g, 'href="/api/google?')
      .replace(/href="https:\/\/www\.google\.com\/search\?/g, 'href="/api/google?');

    // Return the Google Search page content without X-Frame-Options or CSP headers
    return new Response(cleanHtml, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });

  } catch (err: any) {
    console.error('[Google Proxy Error]:', err);
    return new Response(`<p>Error loading Google Search: ${err.message}</p>`, {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }
}
