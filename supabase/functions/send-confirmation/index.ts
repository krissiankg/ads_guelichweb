// Supabase Edge Function — Send confirmation email on new project submission
// Deploy with: supabase functions deploy send-confirmation
// Requires RESEND_API_KEY secret: supabase secrets set RESEND_API_KEY=re_xxx

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';
const FROM_EMAIL = 'GUELICHWEB <christ@guelichweb.online>';

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }
    });
  }

  try {
    const { record } = await req.json();

    if (!record?.email) {
      return new Response(JSON.stringify({ error: 'No email in record' }), { status: 400 });
    }

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
            <div class="greeting">Merci pour votre demande, ${record.name} !</div>
            <p class="text">
              Nous avons bien reçu votre demande de projet. Notre équipe va l'analyser et vous recontactera très prochainement pour discuter des détails.
            </p>
            
            <div class="summary-box">
              <div class="summary-title">Récapitulatif de votre demande</div>
              <div class="summary-row">
                <span class="summary-label">Type de projet</span>
                <span class="summary-value">${record.project_type || '—'}</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">Budget estimé</span>
                <span class="summary-value">${record.budget || '—'}</span>
              </div>
              <div class="summary-row" style="display: block; padding-top: 16px;">
                <span class="summary-label" style="display: block; margin-bottom: 8px;">Description</span>
                <span class="summary-value" style="display: block; text-align: left; color: #475569; font-weight: 400; line-height: 1.5;">
                  ${(record.description || '—').slice(0, 200)}${record.description && record.description.length > 200 ? '...' : ''}
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
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
});
