// Supabase Edge Function — Send confirmation email on new project submission
// Deploy with: supabase functions deploy send-confirmation
// Requires RESEND_API_KEY secret: supabase secrets set RESEND_API_KEY=re_xxx

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';
const FROM_EMAIL = 'GUELICHWEB <noreply@guelichweb.ch>';

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
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 24px; font-weight: 800; background: linear-gradient(135deg, #3b82f6, #6366f1); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
            GUELICHWEB
          </h1>
        </div>
        <div style="background: #f8fafc; border-radius: 16px; padding: 32px; border: 1px solid #e2e8f0;">
          <h2 style="margin: 0 0 16px; color: #1e293b; font-size: 20px;">
            Merci pour votre demande, ${record.name} !
          </h2>
          <p style="color: #64748b; line-height: 1.6; margin: 0 0 16px;">
            Nous avons bien reçu votre demande de projet et nous vous répondrons dans les meilleurs délais.
          </p>
          <div style="background: white; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #e2e8f0;">
            <h3 style="margin: 0 0 12px; color: #475569; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Récapitulatif</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 6px 0; color: #94a3b8; font-size: 14px;">Type de projet</td><td style="padding: 6px 0; color: #1e293b; font-weight: 600; text-align: right;">${record.project_type || '—'}</td></tr>
              <tr><td style="padding: 6px 0; color: #94a3b8; font-size: 14px;">Budget</td><td style="padding: 6px 0; color: #1e293b; font-weight: 600; text-align: right;">${record.budget || '—'}</td></tr>
              <tr><td style="padding: 6px 0; color: #94a3b8; font-size: 14px;">Description</td><td style="padding: 6px 0; color: #1e293b; font-size: 13px; text-align: right;">${(record.description || '—').slice(0, 150)}</td></tr>
            </table>
          </div>
          <p style="color: #94a3b8; font-size: 13px; margin: 16px 0 0;">
            — L'équipe GUELICHWEB
          </p>
        </div>
      </div>
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
