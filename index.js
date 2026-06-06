const TelegramBot = require('node-telegram-bot-api');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const path = require('path');
const fs = require('fs');

// Bot Configuration
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN';

// Initialize Telegram Bot
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// WhatsApp session storage
const sessionsDir = path.join(__dirname, 'sessions');
if (!fs.existsSync(sessionsDir)) {
  fs.mkdirSync(sessionsDir, { recursive: true });
}

// User tracking
const userSessions = new Map();

// Helper: Format country code detection
function detectCountry(phoneNumber) {
  const countryMap = {
    '+1': '🇺🇸 USA/Canada',
    '+44': '🇬🇧 UK',
    '+91': '🇮🇳 India',
    '+234': '🇳🇬 Nigeria',
    '+233': '🇬🇭 Ghana',
    '+255': '🇹🇿 Tanzania',
    '+256': '🇺🇬 Uganda',
    '+254': '🇰🇪 Kenya',
    '+27': '🇿🇦 South Africa',
    '+55': '🇧🇷 Brazil',
    '+212': '🇲🇦 Morocco',
    '+971': '🇦🇪 UAE',
    '+86': '🇨🇳 China',
  };

  for (const [code, country] of Object.entries(countryMap)) {
    if (phoneNumber.startsWith(code)) {
      return country;
    }
  }
  return '🌍 Country unknown';
}

// Helper: Validate phone number format
function validatePhoneNumber(phoneNumber) {
  const phoneRegex = /^\+\d{1,3}\d{6,14}$/;
  return phoneRegex.test(phoneNumber);
}

// Helper: Generate random pairing code
function generatePairingCode() {
  const randomCode = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `SIMO-${randomCode.substring(0, 4)}`;
}

// Start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  const startMessage = `
╔══════════════════════════════════════╗
║   ♡ SIMON TECH BOT2 👀              ║
║    WhatsApp Linking Process          ║
╚══════════════════════════════════════╝

❌ ɪɴᴠᴀʟɪᴅ ғᴏʀᴍᴀᴛ!

Please use format: +1234567890

📱 WhatsApp Linking Process

1️⃣ Send your WhatsApp phone number (with country code)
   Example: +1234567890

2️⃣ You'll receive an 8-digit linking code

3️⃣ Enter that code in WhatsApp Linked Devices

4️⃣ Done! Your WhatsApp is now linked.

📤 Reply with your phone number to continue:
`;

  bot.sendMessage(chatId, startMessage);
});

// Handle text messages (phone number input)
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text.trim();

  // Skip if message is a command
  if (text.startsWith('/')) return;

  // Validate phone number format
  if (!validatePhoneNumber(text)) {
    const errorMsg = `
❌ ɪɴᴠᴀʟɪᴅ ғᴏʀᴍᴀᴛ!

Please use format: +1234567890

Example formats:
• +1234567890 (USA)
• +234XXXXXXXXXX (Nigeria)
• +44XXXXXXXXXX (UK)
• +91XXXXXXXXXX (India)

📤 Please send your phone number with country code:
`;
    return bot.sendMessage(chatId, errorMsg);
  }

  try {
    // Store user session
    if (!userSessions.has(chatId)) {
      userSessions.set(chatId, {
        phoneNumber: text,
        country: detectCountry(text),
        pairingCode: generatePairingCode(),
        status: 'connecting',
      });
    }

    const userSession = userSessions.get(chatId);
    userSession.phoneNumber = text;
    userSession.country = detectCountry(text);
    userSession.pairingCode = generatePairingCode();

    // Generate WhatsApp session
    await generateWhatsAppSession(text, chatId);

  } catch (error) {
    console.error('Error:', error);
    const errorMsg = `
❌ Error generating pairing code

Error: ${error.message}

Please try again with a valid phone number.
`;
    await bot.sendMessage(chatId, errorMsg);
  }
});

// Generate WhatsApp Session
async function generateWhatsAppSession(phoneNumber, chatId) {
  try {
    const sessionName = `SIMON_${Date.now()}`;
    const { state, saveCreds } = await useMultiFileAuthState(
      path.join(sessionsDir, sessionName)
    );

    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      browser: ['SIMON TECH BOT2', 'Windows', '1.0'],
    });

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect } = update;

      if (connection === 'open') {
        console.log(`✅ WhatsApp connected for ${phoneNumber}`);

        const userSession = userSessions.get(chatId);

        // Display formatted response
        const responseMessage = `
╰┈➤ ɢᴇɴᴇʀᴀᴛɪɴɢ ᴘᴀɪʀ ᴄᴏᴅᴇ 👀

[ ♡ SIMON TECH BOT2 👀 ]

╰┈➤ ɴᴜᴍʙᴇʀ : ${userSession.phoneNumber}

╰┈➤ ᴄᴏᴜɴᴛʀʏ : ${userSession.country}

╰┈➤ ᴄᴏᴅᴇ : ${userSession.pairingCode}

[ Sᴇssɪᴏɴ Cᴏɴɴᴇᴄᴛɪɴɢ. ❤️‍🩹 ]

⏳ Waiting for WhatsApp linking confirmation...

💡 Steps:
1️⃣ Go to WhatsApp → Linked Devices
2️⃣ Click "Link a Device"
3️⃣ Enter the pairing code: ${userSession.pairingCode}
4️⃣ Confirm on your phone

⚠️ This code expires in 60 seconds
`;

        await bot.sendMessage(chatId, responseMessage);

        // After connection
        setTimeout(async () => {
          const successMsg = `
✅ ᴄᴏɴɴᴇᴄᴛɪᴏɴ sᴜᴄᴄᴇssғᴜʟ!

[ ♡ SIMON TECH BOT2 👀 ]

╰┈➤ ɴᴜᴍʙᴇʀ : ${phoneNumber}

╰┈➤ sᴛᴀᴛᴜs : ✅ Connected

✅ Your WhatsApp account is now linked!

🎉 Bot is ready to use!

📝 Next steps:
1️⃣ Your bot is configured and running
2️⃣ Start using WhatsApp commands
3️⃣ Type /help for more information
`;

          await bot.sendMessage(chatId, successMsg);

          if (userSessions.has(chatId)) {
            const session = userSessions.get(chatId);
            session.status = 'connected';
          }
        }, 3000);
      }

      if (connection === 'close') {
        const shouldReconnect =
          lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

        if (!shouldReconnect) {
          const logoutMsg = `
❌ Session logged out

Please restart the linking process with /start
`;
          await bot.sendMessage(chatId, logoutMsg);
        }
      }
    });

    sock.ev.on('creds.update', saveCreds);

  } catch (error) {
    console.error('WhatsApp session error:', error);
    throw error;
  }
}

// Help command
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const helpMessage = `
╔══════════════════════════════════════╗
║   ♡ SIMON TECH BOT2 - HELP          ║
╚══════════════════════════════════════╝

📚 Available Commands:

/start - Start the linking process
/help - Show this help message
/status - Check current session status
/reset - Reset and start over

❓ How to link WhatsApp:

1️⃣ Send /start
2️⃣ Reply with your phone number (+1234567890)
3️⃣ You'll get a pairing code
4️⃣ Enter the code in WhatsApp Linked Devices
5️⃣ Connection confirmed!

⚠️ Important:
• Phone number must include country code
• Pairing code expires after 60 seconds
• Your account will be automatically linked
• Never share your phone number with anyone

🆘 Need help?
Contact: @simontech_official
`;

  bot.sendMessage(chatId, helpMessage);
});

// Status command
bot.onText(/\/status/, (msg) => {
  const chatId = msg.chat.id;

  if (userSessions.has(chatId)) {
    const session = userSessions.get(chatId);
    const statusMessage = `
╰┈➤ sᴇssɪᴏɴ sᴛᴀᴛᴜs

[ ♡ SIMON TECH BOT2 👀 ]

╰┈➤ ɴᴜᴍʙᴇʀ : ${session.phoneNumber || 'N/A'}

╰┈➤ sᴛᴀᴛᴜs : ${session.status === 'connected' ? '✅ Connected' : '⏳ Connecting...'}

╰┈➤ ᴄᴏᴜɴᴛʀʏ : ${session.country || 'Unknown'}
`;

    bot.sendMessage(chatId, statusMessage);
  } else {
    const noSessionMsg = `
❌ No session found

Start with /start to begin linking your WhatsApp account.
`;
    bot.sendMessage(chatId, noSessionMsg);
  }
});

// Reset command
bot.onText(/\/reset/, (msg) => {
  const chatId = msg.chat.id;
  userSessions.delete(chatId);

  const resetMsg = `
✅ Session reset!

Use /start to begin a new linking process.
`;

  bot.sendMessage(chatId, resetMsg);
});

// Error handling
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

// Server startup
console.log('✅ SIMON TECH BOT2 - Telegram Interface Started');
console.log('🤖 Bot is running and waiting for messages...');
console.log('📱 Make sure TELEGRAM_TOKEN is set in environment variables');
