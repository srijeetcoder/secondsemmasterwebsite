import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  generatePromotionalEmailHtml,
  generatePromotionalSubject,
  type StudentRecipient,
  type NoticeItem,
} from '@/lib/email/promotionalContent';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow sufficient time for batch sending

/**
 * Promotional & Academic Digest Email Engine
 * - Can be triggered automatically on a weekly schedule by Vercel Cron
 * - Can also be triggered manually via POST by an admin
 */
export async function GET(request: NextRequest) {
  return handlePromotionalCampaign(request);
}

export async function POST(request: NextRequest) {
  return handlePromotionalCampaign(request);
}

async function handlePromotionalCampaign(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'makaut_busters_cron_secure_2026';
  const querySecret = searchParams.get('secret');

  // Verify authorization (Vercel Cron sends Authorization: Bearer <CRON_SECRET>)
  const isAuthorized =
    authHeader === `Bearer ${cronSecret}` ||
    querySecret === cronSecret ||
    process.env.NODE_ENV === 'development';

  if (!isAuthorized) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid or missing cron secret.' },
      { status: 401 }
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const resendApiKey = process.env.RESEND_API_KEY || process.env.NEXT_PUBLIC_RESEND_API_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: 'Supabase configuration is missing in environment variables.' },
      { status: 500 }
    );
  }

  if (!resendApiKey) {
    return NextResponse.json(
      { error: 'RESEND_API_KEY is not set in environment variables.' },
      { status: 500 }
    );
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Fetch student recipients who have an active email
    const { data: profiles, error: profileErr } = await supabase
      .from('profiles')
      .select('id, email, full_name, college, semester')
      .not('email', 'is', null);

    if (profileErr) throw profileErr;

    const recipients: StudentRecipient[] = (profiles || []).filter(
      (p) => p.email && p.email.includes('@')
    );

    if (recipients.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No registered student emails found.',
        sentCount: 0,
      });
    }

    // 2. Fetch latest MAKAUT notices for dynamic content
    let notices: NoticeItem[] = [];
    try {
      const { data: noticeRows } = await supabase
        .from('makaut_notices')
        .select('title, link, published_at')
        .order('published_at', { ascending: false })
        .limit(4);

      if (noticeRows && noticeRows.length > 0) {
        notices = noticeRows;
      }
    } catch {
      // Non-blocking fallback
    }

    const subject = generatePromotionalSubject(notices);
    let sentCount = 0;
    let failedCount = 0;
    const errors: any[] = [];

    // 3. Send emails to recipients via Resend API (rate-friendly batching)
    for (const student of recipients) {
      try {
        const html = generatePromotionalEmailHtml({
          recipient: student,
          notices,
        });

        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: 'Notes4BtechCSE <support@notes4btechcse.cc.cd>',
            to: [student.email],
            subject: subject,
            html: html,
          }),
        });

        if (res.ok) {
          sentCount++;
        } else {
          const errData = await res.json();
          failedCount++;
          errors.push({ email: student.email, error: errData });
        }

        // Small 80ms delay between dispatches to respect rate limits
        await new Promise((resolve) => setTimeout(resolve, 80));
      } catch (err: any) {
        failedCount++;
        errors.push({ email: student.email, error: err.message });
      }
    }

    // 4. Log campaign execution in database if table exists
    try {
      await supabase.from('promotional_campaign_logs').insert({
        subject,
        recipients_count: recipients.length,
        sent_count: sentCount,
        failed_count: failedCount,
        created_at: new Date().toISOString(),
      });
    } catch {
      // Non-blocking
    }

    return NextResponse.json({
      success: true,
      campaignSubject: subject,
      totalRecipients: recipients.length,
      sentCount,
      failedCount,
      errors: errors.slice(0, 5), // Return first few errors if any
    });
  } catch (err: any) {
    console.error('[promotional-cron-error]', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to dispatch promotional campaign.' },
      { status: 500 }
    );
  }
}
