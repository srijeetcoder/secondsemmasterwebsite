import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  let notices: { title: string; link: string; published_at: string }[] = [];

  try {
    // Disable TLS verification to bypass certificate issues on the university domain
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    const res = await fetch('https://www.makautexam.net', {
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch MAKAUT exam site: ${res.statusText}`);
    }

    const html = await res.text();
    
    // Target only the notices container to prevent matching unrelated links
    const noticeSectionRegex = /<ul class="notice">([\s\S]*?)<\/ul>/i;
    const noticeMatch = noticeSectionRegex.exec(html);

    if (noticeMatch) {
      const sectionHtml = noticeMatch[1];
      const linkRegex = /<a[^>]*href=[\x22']([^\x22']*)[\x22'][^>]*>([\s\S]*?)<\/a>/gi;
      let match;

      while ((match = linkRegex.exec(sectionHtml)) !== null) {
        const href = match[1];
        const text = match[2].replace(/<[^>]*>/g, '').trim();

        if (text.length > 3) {
          const absoluteLink = href.startsWith('http')
            ? href
            : `https://www.makautexam.net/${href.startsWith('/') ? href.slice(1) : href}`;
          
          notices.push({
            title: text,
            link: absoluteLink,
            published_at: new Date().toISOString(),
          });
        }
      }
    }

    // Limit to the top 12 latest notices to fit the carousel cleanly
    notices = notices.slice(0, 12);

    // Background archiving to Supabase if configured (non-blocking)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseServiceKey && notices.length > 0) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      // Perform background insert/update ignoring duplicates
      supabase
        .from('makaut_notices')
        .upsert(
          notices.map(n => ({
            title: n.title,
            link: n.link,
            published_at: n.published_at
          })), 
          { onConflict: 'link' }
        )
        .then(({ error }) => {
          if (error) console.error('[notices-archive] Error archiving notices:', error);
        });
    }

  } catch (err: any) {
    console.error('[fetch-notices-scraper] Error:', err);
    // If scraper fails, return empty array rather than breaking the application
    return NextResponse.json({ success: false, error: err.message, notices: [] });
  }

  return NextResponse.json({ success: true, notices });
}
