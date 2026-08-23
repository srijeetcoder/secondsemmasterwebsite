/**
 * Auto-Generated Promotional & Academic Digest Email Generator
 * Creates dynamic, branded dark-mode emails featuring recent MAKAUT notices,
 * subject portals, and exam preparation resources for students.
 */

export interface StudentRecipient {
  id: string;
  email: string;
  full_name?: string;
  college?: string;
  semester?: string;
}

export interface NoticeItem {
  title: string;
  link: string;
  published_at?: string;
}

/** Generate dynamic subject lines */
export function generatePromotionalSubject(notices: NoticeItem[]): string {
  if (notices.length > 0) {
    const latestNotice = notices[0].title.slice(0, 45);
    return `📢 MAKAUT Update & Study Digest: ${latestNotice}...`;
  }
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `📚 Your Semester Study Digest (${dateStr}) — MAKAUT BUSTERS`;
}

/** Generate the complete responsive dark-mode HTML email template */
export function generatePromotionalEmailHtml(params: {
  recipient: StudentRecipient;
  notices: NoticeItem[];
  siteUrl?: string;
}): string {
  const { recipient, notices, siteUrl = 'https://notes4btechcse.cc.cd' } = params;
  const firstName = recipient.full_name?.split(' ')[0] || 'Student';
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const noticesListHtml =
    notices.length > 0
      ? notices
          .slice(0, 4)
          .map(
            (n) => `
            <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-left:3px solid #4AA6A8; border-radius:10px; padding:14px 16px; margin-bottom:10px;">
              <a href="${n.link}" target="_blank" style="font-size:13px; font-weight:600; color:#E8E8E5; text-decoration:none; display:block; line-height:1.4;">
                ${n.title}
              </a>
              <span style="font-size:11px; color:#626766; margin-top:4px; display:inline-block;">Official MAKAUT Notice &rarr;</span>
            </div>`
          )
          .join('')
      : `
        <div style="background:rgba(255,255,255,0.02); border:1px dashed rgba(255,255,255,0.08); border-radius:10px; padding:16px; text-align:center; color:#929694; font-size:13px;">
          All current notices are up to date on the portal.
        </div>`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MAKAUT BUSTERS Study Digest</title>
</head>
<body style="margin:0; padding:0; background-color:#090A0B; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#E8E8E5;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#090A0B; padding:30px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:560px; background-color:#111416; border:1px solid rgba(255,255,255,0.1); border-radius:20px; overflow:hidden; box-shadow:0 25px 50px rgba(0,0,0,0.7);">
          
          <!-- Top Gradient Accent -->
          <tr>
            <td style="height:4px; background:linear-gradient(90deg, #4AA6A8 0%, #6D9B82 50%, #A58A55 100%);"></td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 20px 32px; text-align:left;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="display:inline-block; vertical-align:middle; width:36px; height:36px; line-height:36px; text-align:center; background:rgba(74,166,168,0.15); border:1px solid rgba(74,166,168,0.3); border-radius:10px;">
                      <span style="font-size:18px;">🎓</span>
                    </div>
                    <span style="display:inline-block; vertical-align:middle; font-size:15px; font-weight:700; color:#FFFFFF; margin-left:10px; letter-spacing:-0.3px;">
                      MAKAUT BUSTERS
                    </span>
                  </td>
                  <td align="right" style="font-size:11px; color:#626766; font-weight:500;">
                    ${currentDate}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hero Greeting -->
          <tr>
            <td style="padding:0 32px 20px 32px;">
              <h2 style="margin:0; font-size:20px; font-weight:700; color:#FFFFFF; line-height:1.3;">
                Hey ${firstName}, here is your study digest! 🚀
              </h2>
              <p style="margin:8px 0 0 0; font-size:14px; color:#929694; line-height:1.5;">
                We've organized the latest university updates and subject notes to help you stay ahead in your semester preparation.
              </p>
            </td>
          </tr>

          <!-- MAKAUT Live Notices Section -->
          <tr>
            <td style="padding:0 32px 20px 32px;">
              <div style="display:flex; align-items:center; margin-bottom:12px;">
                <span style="font-size:12px; font-weight:700; color:#A58A55; text-transform:uppercase; letter-spacing:1px;">
                  🔔 Recent MAKAUT Exam & University Notices
                </span>
              </div>
              ${noticesListHtml}
            </td>
          </tr>

          <!-- 4 Subject Portals Grid -->
          <tr>
            <td style="padding:0 32px 28px 32px;">
              <span style="font-size:12px; font-weight:700; color:#4AA6A8; text-transform:uppercase; letter-spacing:1px; display:block; margin-bottom:14px;">
                📖 Active Study Portals
              </span>
              
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="48%" style="vertical-align:top; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:12px; padding:14px;">
                    <strong style="color:#4AA6A8; font-size:13px;">ESCS 201</strong>
                    <div style="font-size:12px; font-weight:600; color:#E8E8E5; margin-top:2px;">C & Programming</div>
                    <p style="font-size:11px; color:#626766; margin:6px 0 10px 0; line-height:1.3;">Pointers, arrays, algorithms & practice codes.</p>
                    <a href="https://cnotesbycsrijeet.vercel.app/" target="_blank" style="font-size:11px; font-weight:600; color:#4AA6A8; text-decoration:none;">Open Portal &rarr;</a>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" style="vertical-align:top; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:12px; padding:14px;">
                    <strong style="color:#6D9B82; font-size:13px;">BSCH 201</strong>
                    <div style="font-size:12px; font-weight:600; color:#E8E8E5; margin-top:2px;">Chemistry-I Theory</div>
                    <p style="font-size:11px; color:#626766; margin:6px 0 10px 0; line-height:1.3;">MOT, kinetics, spectroscopy & solved notes.</p>
                    <a href="https://chem-notes-nhm8.vercel.app/" target="_blank" style="font-size:11px; font-weight:600; color:#6D9B82; text-decoration:none;">Open Portal &rarr;</a>
                  </td>
                </tr>
                <tr><td height="10" colspan="3"></td></tr>
                <tr>
                  <td width="48%" style="vertical-align:top; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:12px; padding:14px;">
                    <strong style="color:#A58A55; font-size:13px;">BSCH 291</strong>
                    <div style="font-size:12px; font-weight:600; color:#E8E8E5; margin-top:2px;">Chemistry Lab</div>
                    <p style="font-size:11px; color:#626766; margin:6px 0 10px 0; line-height:1.3;">Titration tables, observations & viva questions.</p>
                    <a href="https://pracchem.vercel.app/" target="_blank" style="font-size:11px; font-weight:600; color:#A58A55; text-decoration:none;">Open Portal &rarr;</a>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" style="vertical-align:top; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:12px; padding:14px;">
                    <strong style="color:#827A9B; font-size:13px;">BSM 201</strong>
                    <div style="font-size:12px; font-weight:600; color:#E8E8E5; margin-top:2px;">Mathematics-II</div>
                    <p style="font-size:11px; color:#626766; margin:6px 0 10px 0; line-height:1.3;">Linear algebra, calculus & solved tutorials.</p>
                    <a href="https://mathsnotesbysrijeet.vercel.app/" target="_blank" style="font-size:11px; font-weight:600; color:#827A9B; text-decoration:none;">Open Portal &rarr;</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Primary CTA Button -->
          <tr>
            <td style="padding:0 32px 32px 32px; text-align:center;">
              <a href="${siteUrl}" target="_blank" style="display:inline-block; background-color:#4AA6A8; color:#090A0B; font-size:14px; font-weight:700; text-decoration:none; padding:14px 32px; border-radius:12px; box-shadow:0 6px 20px rgba(74,166,168,0.3);">
                Access Central Hub &rarr;
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#0B0D0E; padding:22px 32px; text-align:center; border-top:1px solid rgba(255,255,255,0.04);">
              <p style="margin:0; font-size:12px; color:#626766; line-height:1.5;">
                You received this study digest because you registered on MAKAUT BUSTERS.
              </p>
              <p style="margin:8px 0 0 0; font-size:11px; color:#444847;">
                &copy; 2026 MAKAUT BUSTERS &middot; <a href="${siteUrl}" style="color:#4AA6A8; text-decoration:none;">notes4btechcse.cc.cd</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
