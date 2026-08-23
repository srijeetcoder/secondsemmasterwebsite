import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

export async function GET() {
  return new NextResponse('google-site-verification: google2ead2b84c193dfc9.html', {
    status: 200,
    headers: {
      'Content-Type': 'text/html',
    },
  });
}
