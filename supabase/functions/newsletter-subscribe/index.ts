import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

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
  const { name, couponCode, language } = data;

  const content = language === 'fr' ? {
    subject: '🎁 Bienvenue chez GUELICHWEB - Votre coupon -10% vous attend !',
    greeting: `Bonjour ${name || 'cher(e) abonné(e)'} 👋,`,
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
    greeting: `Hello ${name || 'valued subscriber'} 👋,`,
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
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      background-color: #f8fafc;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .logo {
      max-width: 200px;
      height: auto;
      margin-bottom: 20px;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 20px;
      color: #0f172a;
    }
    .text {
      font-size: 16px;
      margin-bottom: 20px;
      color: #475569;
    }
    .coupon-box {
      background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
      border-radius: 16px;
      padding: 30px;
      text-align: center;
      margin: 30px 0;
    }
    .coupon-label {
      color: #fff;
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 1px;
      margin-bottom: 10px;
    }
    .coupon-code {
      background-color: #ffffff;
      color: #dc2626;
      font-size: 32px;
      font-weight: 800;
      padding: 15px 30px;
      border-radius: 12px;
      display: inline-block;
      letter-spacing: 3px;
      margin: 10px 0;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .services-list {
      background-color: #f1f5f9;
      border-radius: 12px;
      padding: 20px 30px;
      margin: 20px 0;
    }
    .services-list ul {
      list-style: none;
      padding: 0;
      margin: 10px 0;
    }
    .services-list li {
      padding: 8px 0;
      color: #334155;
      font-size: 15px;
    }
    .services-list li:before {
      content: "✓ ";
      color: #10b981;
      font-weight: bold;
      margin-right: 10px;
    }
    .info-box {
      background-color: #eff6ff;
      border-left: 4px solid #3b82f6;
      padding: 15px 20px;
      margin: 20px 0;
      border-radius: 8px;
      font-size: 14px;
      color: #1e40af;
    }
    .cta-section {
      text-align: center;
      margin: 40px 0;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
      color: #ffffff;
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 16px;
      margin: 10px;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
      transition: all 0.3s ease;
    }
    .cta-button:hover {
      box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
      transform: translateY(-2px);
    }
    .cta-button-secondary {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }
    .cta-button-secondary:hover {
      box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
    }
    .footer {
      background-color: #1e293b;
      color: #cbd5e1;
      padding: 30px;
      text-align: center;
      font-size: 14px;
    }
    .footer-privacy {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #334155;
      font-size: 13px;
    }
    .divider {
      height: 1px;
      background: linear-gradient(to right, transparent, #cbd5e1, transparent);
      margin: 30px 0;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 30px 20px;
      }
      .coupon-code {
        font-size: 24px;
        padding: 12px 20px;
      }
      .cta-button {
        display: block;
        margin: 10px 0;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://guelichweb.site/logo_couleur.png" alt="GUELICHWEB" class="logo" />
    </div>

    <div class="content">
      <div class="greeting">${content.greeting}</div>

      <div class="text">
        ${content.thanks}
      </div>

      <div class="text">
        ${content.giftTitle}
      </div>

      <div class="coupon-box">
        <div class="coupon-label">${content.codeLabel}</div>
        <div class="coupon-code">${couponCode}</div>
      </div>

      <div class="services-list">
        <div style="font-weight: 600; margin-bottom: 10px;">${content.validOn}</div>
        <ul>
          ${content.services.map(service => `<li>${service}</li>`).join('')}
        </ul>
      </div>

      <div class="info-box">
        🕒 ${content.validity}<br>
        📌 ${content.conditions}
      </div>

      <div class="divider"></div>

      <div class="text" style="font-size: 18px; font-weight: 600; text-align: center;">
        ${content.readyTitle}
      </div>

      <div class="text" style="text-align: center;">
        ${content.readyText}
      </div>

      <div class="cta-section">
        <a href="https://guelichweb.site/#project-form" class="cta-button">
          ${content.ctaStart}
        </a>
        <a href="https://guelichweb.site/#contact" class="cta-button cta-button-secondary">
          ${content.ctaQuote}
        </a>
      </div>
    </div>

    <div class="footer">
      <div>${content.closing}</div>
      <div>${content.team}</div>
      <div style="margin-top: 10px;">${content.tagline}</div>

      <div class="footer-privacy">
        ${content.privacy}
      </div>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
${content.greeting}

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

${content.ctaStart}: https://guelichweb.site/#project-form
${content.ctaQuote}: https://guelichweb.site/#contact

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
    const { name, email, consent, language = 'fr' }: SubscribeRequest = await req.json();

    if (!email || !consent) {
      return new Response(
        JSON.stringify({ error: 'Email and consent are required' }),
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

    const { data: subscriber, error: dbError } = await fetch(
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
          name: name || '',
          email,
          consent,
        }),
      }
    ).then(res => res.json());

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ error: 'Failed to save subscription' }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (!resendApiKey) {
      console.warn('RESEND_API_KEY not configured. Email will not be sent.');
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Subscription saved (email not sent - RESEND_API_KEY not configured)',
          subscriber,
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
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
        from: 'GUELICHWEB <newsletter@guelichweb.site>',
        to: [email],
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Resend API error:', errorText);
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Subscription saved but email failed to send',
          subscriber,
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Subscription successful! Check your email for your welcome gift.',
        subscriber,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
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
