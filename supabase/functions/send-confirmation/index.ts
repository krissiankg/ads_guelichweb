// Supabase Edge Function — Send confirmation email on new project submission
// Deploy with: supabase functions deploy send-confirmation
// Requires RESEND_API_KEY secret: supabase secrets set RESEND_API_KEY=re_xxx

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const FROM_EMAIL = 'GUELICHWEB <christ@guelichweb.online>';
// Only submissions created this recently get a confirmation email (stops replays of old rows).
const MAX_SUBMISSION_AGE_MS = 10 * 60 * 1000;
// Tolerated clock difference between the database and this function.
const CLOCK_SKEW_MS = 60 * 1000;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ALLOWED_TABLES = ['project_submissions', 'contest_submissions'];

const jsonHeaders = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }
    });
  }

  try {
    // Called by the database webhook on new submissions. The request body is never
    // trusted: the submission is re-read from the database by its id, so this
    // endpoint cannot be used to send arbitrary emails from our domain.
    const payload = await req.json();
    const id = payload?.record?.id;
    const table = ALLOWED_TABLES.includes(payload?.table) ? payload.table : 'project_submissions';

    if (typeof id !== 'string' || !UUID_RE.test(id)) {
      return new Response(JSON.stringify({ error: 'Invalid record id' }), { status: 400, headers: jsonHeaders });
    }

    const rowUrl = `${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`;
    const dbHeaders = {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Prefer': 'return=representation',
    };

    const lookup = await fetch(`${rowUrl}&select=*`, { headers: dbHeaders });
    if (!lookup.ok) {
      console.error('Submission lookup failed:', await lookup.text());
      return new Response(JSON.stringify({ error: 'Failed to load submission' }), { status: 502, headers: jsonHeaders });
    }
    const record = (await lookup.json())[0];

    if (!record?.email) {
      return new Response(JSON.stringify({ error: 'Submission not found' }), { status: 404, headers: jsonHeaders });
    }

    // created_at can be set by whoever inserts the row: reject future dates too.
    const ageMs = Date.now() - new Date(record.created_at).getTime();
    if (!(ageMs >= -CLOCK_SKEW_MS && ageMs <= MAX_SUBMISSION_AGE_MS)) {
      return new Response(JSON.stringify({ error: 'Submission too old' }), { status: 409, headers: jsonHeaders });
    }

    // Claim the email atomically so each submission gets exactly one confirmation,
    // however many times this endpoint is called.
    const claim = await fetch(`${rowUrl}&confirmation_sent_at=is.null`, {
      method: 'PATCH',
      headers: dbHeaders,
      body: JSON.stringify({ confirmation_sent_at: new Date().toISOString() }),
    });
    if (claim.ok) {
      if ((await claim.json()).length === 0) {
        return new Response(JSON.stringify({ error: 'Confirmation already sent' }), { status: 409, headers: jsonHeaders });
      }
    } else if (claim.status === 400) {
      // confirmation_sent_at missing (supabase/security_rls_policies.sql not run yet):
      // send anyway, protected only by the age check above.
      console.error('Confirmation claim failed:', await claim.text());
    } else {
      console.error('Confirmation claim failed:', await claim.text());
      return new Response(JSON.stringify({ error: 'Failed to claim submission' }), { status: 502, headers: jsonHeaders });
    }

    const name = escapeHtml(record.name ?? record.full_name);
    const projectType = escapeHtml(record.project_type || '—');
    const budget = escapeHtml(record.budget || '—');
    const rawDescription = String(record.description ?? record.activity_description ?? '');
    const description = rawDescription
      ? escapeHtml(rawDescription.slice(0, 200)) + (rawDescription.length > 200 ? '...' : '')
      : '—';

    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmation de réception</title>
        <style>
          body { margin: 0; padding: 0; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #334155; background-color: #f1f5f9; }
          .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
          .header { background-color: #ffffff; padding: 32px 20px; text-align: center; border-bottom: 1px solid #e2e8f0; }
          .logo { max-width: 180px; height: auto; }
          .content { padding: 40px 32px; }
          .greeting { font-size: 24px; font-weight: 700; color: #0f172a; margin-bottom: 16px; }
          .text { font-size: 16px; color: #475569; margin-bottom: 24px; }
          .summary-box { background-color: #f8fafc; border-radius: 12px; padding: 24px; margin: 32px 0; border: 1px solid #e2e8f0; }
          .summary-title { font-size: 14px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; }
          .summary-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e2e8f0; }
          .summary-row:last-child { border-bottom: none; }
          .summary-label { color: #94a3b8; font-size: 14px; }
          .summary-value { color: #0f172a; font-weight: 600; font-size: 14px; text-align: right; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 600; font-size: 15px; margin-top: 24px; }
          .footer { background-color: #f8fafc; padding: 24px; text-align: center; font-size: 13px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://offre.guelichweb.online/logo_email.png" alt="GUELICHWEB" class="logo" />
          </div>
          
          <div class="content">
            <div class="greeting">Merci pour votre demande, ${name} !</div>
            <p class="text">
              Nous avons bien reçu votre demande de projet. Notre équipe va l'analyser et vous recontactera très prochainement pour discuter des détails.
            </p>
            
            <div class="summary-box">
              <div class="summary-title">Récapitulatif de votre demande</div>
              <div class="summary-row">
                <span class="summary-label">Type de projet</span>
                <span class="summary-value">${projectType}</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">Budget estimé</span>
                <span class="summary-value">${budget}</span>
              </div>
              <div class="summary-row" style="display: block; padding-top: 16px;">
                <span class="summary-label" style="display: block; margin-bottom: 8px;">Description</span>
                <span class="summary-value" style="display: block; text-align: left; color: #475569; font-weight: 400; line-height: 1.5;">
                  ${description}
                </span>
              </div>
            </div>

            <div style="text-align: center;">
              <a href="https://offre.guelichweb.online" class="cta-button">Visiter notre site web</a>
            </div>
          </div>

          <div class="footer">
            <p style="margin-bottom: 12px;">Une question ? Contactez-nous à <a href="mailto:christ@guelichweb.online" style="color: #2563eb; text-decoration: none;">christ@guelichweb.online</a></p>
            <p>© ${new Date().getFullYear()} GUELICHWEB. Design is our word.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [record.email],
        subject: 'GUELICHWEB — Votre demande de projet a bien été reçue',
        html: htmlBody
      })
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), { status: res.ok ? 200 : 502, headers: jsonHeaders });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: jsonHeaders });
  }
});
