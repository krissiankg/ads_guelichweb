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
      <div class="greeting">${content.greeting}</div>
      
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
        from: 'GUELICHWEB <christ@guelichweb.online>',
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
