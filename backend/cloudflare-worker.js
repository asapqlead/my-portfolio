/**
 * CLOUDFLARE WORKER TELEGRAM BOT PROXY
 * -------------------------------------
 * Instructions to deploy on Cloudflare:
 * 1. Log in to your Cloudflare Dashboard -> Compute (Workers & Pages) -> Workers.
 * 2. Click "Create Worker" and name it (e.g., `telegram-contact-bot`).
 * 3. Replace the default code in the online code editor with this exact code and hit "Deploy".
 * 4. Go to Settings -> Variables and Secrets -> Add the following Secrets:
 *    - TELEGRAM_BOT_TOKEN: Your new bot token from @BotFather
 *    - TELEGRAM_CHAT_ID: 1099543504
 *    - ALLOWED_ORIGIN: "*" (or replace with your domain e.g., https://your-portfolio-domain.com)
 */

export default {
  async fetch(request, env) {
    // 1. Handle CORS Preflight (OPTIONS request) so browser fetch requests aren't blocked
    const corsHeaders = {
      'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // 2. Only allow POST requests
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    try {
      // 3. Parse incoming JSON body from frontend script.js
      const { name, contact, message } = await request.json();

      if (!name || !contact || !message) {
        return new Response(JSON.stringify({ error: 'Please complete all form fields.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 4. Retrieve secure environment secrets from Cloudflare's encrypted vault
      const token = env.TELEGRAM_BOT_TOKEN;
      const chatId = env.TELEGRAM_CHAT_ID;

      if (!token || !chatId) {
        return new Response(JSON.stringify({ error: 'Server secrets not configured in Cloudflare Dashboard' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 5. Construct Telegram message payload and communicate safely server-to-server
      const textPayload = `🚀 <b>New Collab Request from Portfolio!</b>\n\n👤 <b>Name:</b> ${name}\n🔗 <b>Contact:</b> ${contact}\n💬 <b>Message:</b>\n${message}`;

      const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: textPayload,
          parse_mode: 'HTML',
        }),
      });

      const data = await telegramResponse.json();

      if (data.ok) {
        return new Response(JSON.stringify({ success: true, message: 'Message sent successfully!' }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        return new Response(JSON.stringify({ error: 'Telegram API submission failed', details: data }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Internal Server Error', details: err.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
