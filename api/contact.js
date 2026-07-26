/**
 * VERCEL SERVERLESS FUNCTION - TELEGRAM BOT HANDLER
 * -------------------------------------------------
 * Exposed at endpoint: `/api/contact`
 * 
 * Environment variables required in Vercel Project Settings -> Environment Variables:
 * - TELEGRAM_BOT_TOKEN: Bot token from @BotFather
 * - TELEGRAM_CHAT_ID: Target Telegram Chat ID (e.g., 1099543504)
 */

export default async function handler(req, res) {
  // Handle CORS & Preflight (in case you ever test across ports or origins)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { name, contact, message } = req.body || {};

    if (!name || !contact || !message) {
      return res.status(400).json({ error: 'Please complete all form fields.' });
    }

    // Retrieve environment variables configured in Vercel Dashboard
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      console.error('Missing Telegram secrets in process.env');
      return res.status(500).json({
        error: 'Server secrets (TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID) are not configured in Vercel Dashboard.'
      });
    }

    // Construct formatted Telegram message payload
    const textPayload = `🚀 <b>New Collab Request from Portfolio!</b>\n\n👤 <b>Name:</b> ${name}\n🔗 <b>Contact:</b> ${contact}\n💬 <b>Message:</b>\n\n${message}`;

    // Send payload securely server-to-server to Telegram API
    const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: textPayload,
        parse_mode: 'HTML',
      }),
    });

    const data = await telegramResponse.json().catch(() => ({}));

    if (data.ok) {
      return res.status(200).json({ success: true, message: 'Message sent successfully!' });
    } else {
      console.error('Telegram API submission error:', data);
      return res.status(502).json({ error: 'Telegram API submission failed', details: data });
    }
  } catch (error) {
    console.error('Server exception during contact form handling:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
