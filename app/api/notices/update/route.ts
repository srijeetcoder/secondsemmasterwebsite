import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force dynamic execution so Next.js doesn't cache the scrape result statically
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const cronSecret = process.env.CRON_SECRET;

  // Protect the route using a custom CRON_SECRET if configured
  if (cronSecret && token !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Requires the service_role key to bypass RLS policies and insert notices
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { error: 'Supabase credentials (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY) missing in server environment.' },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Disable TLS verification warning/check to bypass MAKAUT's incomplete SSL chain
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    const res = await fetch('https://makautwb.ac.in/page.php?id=340', {
      cache: 'no-store',
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch MAKAUT page: ${res.statusText}`);
    }

    const html = await res.text();
    const regex = /<a[^>]*href=[\x22']([^\x22']*)[\x22'][^>]*>([\s\S]*?)<\/a>/gi;
    const notices: { title: string; link: string }[] = [];
    let match;

    while ((match = regex.exec(html)) !== null) {
      const href = match[1];
      const text = match[2].replace(/<[^>]*>/g, '').trim();

      // Focus on PDF links within the standard upload directories
      if (href.includes('pdf') && href.includes('datas/users/')) {
        const absoluteLink = href.startsWith('http')
          ? href
          : `https://makautwb.ac.in/${href.startsWith('/') ? href.slice(1) : href}`;
        
        if (text.length > 3 && !notices.some(n => n.link === absoluteLink)) {
          notices.push({
            title: text,
            link: absoluteLink
          });
        }
      }
    }

    if (notices.length === 0) {
      return NextResponse.json({ success: true, message: 'No new notices parsed from the page.' });
    }

    // Upsert the results using the 'link' column to prevent duplicates
    const { data, error } = await supabase
      .from('makaut_notices')
      .upsert(notices, { onConflict: 'link' })
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      count: notices.length,
      upserted: data,
    });
  } catch (err: any) {
    console.error('[fetch-notices] Error:', err);
    return NextResponse.json(
      { error: err.message || 'An error occurred while fetching notices.' },
      { status: 500 }
    );
  }
}
