import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const EMAIL_RE = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

interface SubscribeRequest {
  name: string;
  email: string;
  consent: boolean;
  language: 'fr' | 'en';
}

interface WelcomeEmailData {
  name: string;
  email: string;
  couponCode: string;
  language: 'fr' | 'en';
}

function getWelcomeEmailTemplate(data: WelcomeEmailData): { subject: string; html: string; text: string } {
  // `name` is typed by the visitor: it is HTML-escaped in the HTML part (no injected
  // markup or links) and kept as typed in the plain-text part.
  const { name, couponCode, language } = data;

  const content = language === 'fr' ? {
    subject: '🎁 Bienvenue chez GUELICHWEB - Votre coupon -10% vous attend !',
    greeting: (displayName: string) => `Bonjour ${displayName || 'cher(e) abonné(e)'} 👋,`,
    thanks: 'Merci de vous être inscrit(e) à la newsletter <strong>GUELICHWEB</strong> !<br>Nous sommes ravis de vous compter parmi nous.',
    giftTitle: '🎁 Voici votre coupon exclusif de -10% sur votre premier projet :',
    codeLabel: 'CODE PROMO :',
    validOn: '👉 Ce coupon est valable sur :',
    services: [
      'Création de site web',
      'Application web ou mobile',
      'Projet e-commerce',
      'SEO & solutions digitales'
    ],
    validity: '<strong>Validité :</strong> 30 jours à compter d\'aujourd\'hui',
    conditions: '<strong>Conditions :</strong> coupon utilisable une seule fois, non cumulable avec d\'autres offres.',
    readyTitle: '🚀 Prêt(e) à lancer votre projet ?',
    readyText: `Utilisez simplement le code <strong>${couponCode}</strong> lors de votre demande de devis ou mentionnez-le lors de votre prise de contact.`,
    ctaStart: 'Démarrer mon projet maintenant',
    ctaQuote: 'Demander un devis gratuit',
    privacy: '🔒 Vos données sont en sécurité.<br>Vous pouvez vous désinscrire à tout moment depuis nos emails.',
    closing: 'À très bientôt,',
    team: '<strong>L\'équipe GUELICHWEB</strong>',
    tagline: '🌐 Votre partenaire digital premium'
  } : {
    subject: '🎁 Welcome to GUELICHWEB - Your 10% OFF coupon awaits!',
    greeting: (displayName: string) => `Hello ${displayName || 'valued subscriber'} 👋,`,
    thanks: 'Thank you for subscribing to the <strong>GUELICHWEB</strong> newsletter!<br>We\'re delighted to have you with us.',
    giftTitle: '🎁 Here\'s your exclusive 10% OFF coupon for your first project:',
    codeLabel: 'PROMO CODE:',
    validOn: '👉 This coupon is valid for:',
    services: [
      'Website creation',
      'Web or mobile application',
      'E-commerce project',
      'SEO & digital solutions'
    ],
    validity: '<strong>Validity:</strong> 30 days from today',
    conditions: '<strong>Conditions:</strong> coupon usable once, cannot be combined with other offers.',
    readyTitle: '🚀 Ready to launch your project?',
    readyText: `Simply use the code <strong>${couponCode}</strong> when requesting a quote or mention it when contacting us.`,
    ctaStart: 'Start my project now',
    ctaQuote: 'Request a free quote',
    privacy: '🔒 Your data is secure.<br>You can unsubscribe at any time from our emails.',
    closing: 'See you soon,',
    team: '<strong>The GUELICHWEB Team</strong>',
    tagline: '🌐 Your premium digital partner'
  };

  const html = `
<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${content.subject}</title>
  <style>
    body { margin: 0; padding: 0; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #334155; background-color: #f1f5f9; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
    .header { background-color: #ffffff; padding: 32px 20px; text-align: center; border-bottom: 1px solid #e2e8f0; }
    .logo { max-width: 180px; height: auto; }
    .content { padding: 40px 32px; }
    .greeting { font-size: 24px; font-weight: 700; color: #0f172a; margin-bottom: 24px; }
    .text { font-size: 16px; color: #475569; margin-bottom: 24px; line-height: 1.7; }
    .coupon-box { background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%); border: 2px dashed #fb923c; border-radius: 16px; padding: 32px; text-align: center; margin: 32px 0; position: relative; overflow: hidden; }
    .coupon-label { color: #9a3412; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px; }
    .coupon-code { background-color: #ffffff; color: #ea580c; font-size: 36px; font-weight: 800; padding: 16px 32px; border-radius: 12px; display: inline-block; letter-spacing: 2px; box-shadow: 0 4px 6px rgba(234, 88, 12, 0.1); }
    .services-list { background-color: #f8fafc; border-radius: 12px; padding: 24px; margin: 32px 0; border: 1px solid #e2e8f0; }
    .services-title { font-weight: 600; color: #0f172a; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
    .services-list ul { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .services-list li { display: flex; align-items: center; color: #475569; font-size: 14px; background: white; padding: 8px 12px; border-radius: 8px; border: 1px solid #e2e8f0; }
    .check-icon { color: #10b981; margin-right: 8px; font-weight: bold; }
    .cta-section { text-align: center; margin: 40px 0 20px; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3); transition: all 0.3s ease; }
    .cta-secondary { display: inline-block; margin-top: 16px; color: #64748b; text-decoration: none; font-size: 14px; font-weight: 500; }
    .cta-secondary:hover { color: #2563eb; text-decoration: underline; }
    .footer { background-color: #f8fafc; padding: 32px; text-align: center; font-size: 13px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
    .social-links { margin-bottom: 20px; }
    .social-link { display: inline-block; margin: 0 8px; color: #64748b; text-decoration: none; }
    @media only screen and (max-width: 600px) {
      .container { margin: 0; border-radius: 0; }
      .services-list ul { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://offre.guelichweb.online/logo_email.png" alt="GUELICHWEB" class="logo" />
    </div>

    <div class="content">
      <div class="greeting">${content.greeting(escapeHtml(name))}</div>
      
      <div class="text">
        ${content.thanks}
      </div>

      <div class="coupon-box">
        <div class="coupon-label">${content.codeLabel}</div>
        <div class="coupon-code">${couponCode}</div>
        <div style="margin-top: 16px; font-size: 13px; color: #9a3412;">
          ${content.validity}
        </div>
      </div>

      <div class="services-list">
        <div class="services-title">
          <span>🎁</span> ${content.validOn}
        </div>
        <ul>
          ${content.services.map(service => `<li><span class="check-icon">✓</span>${service}</li>`).join('')}
        </ul>
      </div>

      <div class="text" style="text-align: center; margin-top: 32px;">
        ${content.readyText}
      </div>

      <div class="cta-section">
        <a href="https://offre.guelichweb.online/#project-form" class="cta-button">
          ${content.ctaStart}
        </a>
        <br>
        <a href="https://offre.guelichweb.online/#contact" class="cta-secondary">
          ${content.ctaQuote} →
        </a>
      </div>
    </div>

    <div class="footer">
      <p style="margin-bottom: 16px; font-weight: 600; color: #475569;">${content.team}</p>
      <p style="margin-bottom: 24px;">${content.tagline}</p>
      
      <div style="border-top: 1px solid #e2e8f0; margin: 24px 0;"></div>
      
      <p style="font-size: 12px; line-height: 1.5;">
        ${content.privacy}
      </p>
      <p style="font-size: 12px; margin-top: 12px;">
        © ${new Date().getFullYear()} GUELICHWEB. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
${content.greeting(name)}

${content.thanks.replace(/<\/?strong>/g, '').replace(/<br>/g, '\n')}

${content.giftTitle}

${content.codeLabel} ${couponCode}

${content.validOn}
${content.services.map(s => `- ${s}`).join('\n')}

${content.validity.replace(/<\/?strong>/g, '')}
${content.conditions.replace(/<\/?strong>/g, '')}

---

${content.readyTitle}

${content.readyText.replace(/<\/?strong>/g, '')}

${content.ctaStart}: https://offre.guelichweb.online/#project-form
${content.ctaQuote}: https://offre.guelichweb.online/#contact

---

${content.closing}
${content.team.replace(/<\/?strong>/g, '')}
${content.tagline}

${content.privacy.replace(/<\/?strong>/g, '').replace(/<br>/g, '\n')}
  `;

  return {
    subject: content.subject,
    html,
    text
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const body: Partial<SubscribeRequest> = await req.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const name = typeof body.name === 'string' ? body.name.trim().slice(0, 100) : '';
    const consent = body.consent === true;
    const language: 'fr' | 'en' = body.language === 'en' ? 'en' : 'fr';

    if (!consent || email.length > 254 || !EMAIL_RE.test(email)) {
      return new Response(
        JSON.stringify({ error: 'A valid email and consent are required' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const insertResponse = await fetch(
      `${supabaseUrl}/rest/v1/newsletter_subscribers`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          name,
          email,
          consent,
        }),
      }
    );

    const respond = (payload: unknown, status: number) => new Response(
      JSON.stringify(payload),
      { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    const alreadySubscribedMessage = language === 'fr'
      ? 'Cette adresse email est déjà inscrite à la newsletter.'
      : 'This email address is already subscribed to the newsletter.';

    // 409 = unique email already in the table
    const alreadySubscribed = insertResponse.status === 409;
    if (!alreadySubscribed && !insertResponse.ok) {
      console.error('Database error:', await insertResponse.text());
      return respond({ error: 'Failed to save subscription' }, 500);
    }
    const subscriber = alreadySubscribed ? null : (await insertResponse.json())[0];

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.warn('RESEND_API_KEY not configured. Email will not be sent.');
      return alreadySubscribed
        ? respond({ error: alreadySubscribedMessage }, 409)
        : respond({ success: true, message: 'Subscription saved (email not sent - RESEND_API_KEY not configured)', subscriber }, 200);
    }

    // Claim the welcome email atomically: it is sent only while welcome_email_sent_at
    // is empty. A repeat subscription gets nothing (this endpoint cannot flood an
    // inbox), except when the previous welcome email failed to send.
    const subscriberUrl = `${supabaseUrl}/rest/v1/newsletter_subscribers?email=eq.${encodeURIComponent(email)}`;
    const dbHeaders = {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Prefer': 'return=representation',
    };
    const claimResponse = await fetch(`${subscriberUrl}&welcome_email_sent_at=is.null`, {
      method: 'PATCH',
      headers: dbHeaders,
      body: JSON.stringify({ welcome_email_sent_at: new Date().toISOString() }),
    });
    let claimed: boolean;
    if (claimResponse.ok) {
      claimed = (await claimResponse.json()).length > 0;
    } else {
      // welcome_email_sent_at missing (supabase/security_rls_policies.sql not run yet):
      // only a brand-new subscriber gets the email.
      console.error('Welcome email claim failed:', await claimResponse.text());
      claimed = !alreadySubscribed;
    }

    if (!claimed) {
      return alreadySubscribed
        ? respond({ error: alreadySubscribedMessage }, 409)
        : respond({ success: true, message: 'Subscription successful!', subscriber }, 200);
    }

    const emailTemplate = getWelcomeEmailTemplate({
      name,
      email,
      couponCode: 'WELCOME10',
      language,
    });

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'GUELICHWEB <christ@guelichweb.online>',
        to: [email],
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text,
      }),
    });

    if (!emailResponse.ok) {
      console.error('Resend API error:', await emailResponse.text());
      // Release the claim so the next attempt sends the welcome email.
      if (claimResponse.ok) {
        await fetch(subscriberUrl, { method: 'PATCH', headers: dbHeaders, body: JSON.stringify({ welcome_email_sent_at: null }) });
      }
      return respond({
        error: language === 'fr'
          ? 'Inscription enregistrée, mais l\'email de bienvenue n\'a pas pu être envoyé. Réessayez dans quelques minutes.'
          : 'Subscription saved, but the welcome email could not be sent. Please try again in a few minutes.',
      }, 502);
    }

    return respond({
      success: true,
      message: 'Subscription successful! Check your email for your welcome gift.',
      subscriber,
    }, 200);
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
