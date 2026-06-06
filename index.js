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
const activeSockets = new Map();

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

// Start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  const startMessage = `
╔══════════════════════════════════════╗
║   ♡ SIMON TECH BOT2 👀              ║
║    WhatsApp Linking Process          ║
╚══════════════════════════════════════╝

📱 WhatsApp Linking Process

1️⃣ Send your WhatsApp phone number (with country code)
   Example: +1234567890

2️⃣ You'll receive a REAL 8-digit linking code from WhatsApp

3️⃣ Enter that code in WhatsApp → Linked Devices

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
    // Show loading message
    await bot.sendMessage(chatId, '⏳ Requesting pairing code from WhatsApp...');

    // Generate real WhatsApp pairing code
    await generateWhatsAppPairingCode(text, chatId);

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

// Generate REAL WhatsApp Pairing Code
async function generateWhatsAppPairingCode(phoneNumber, chatId) {
  try {
    const sessionName = `SIMON_${Date.now()}`;
    const sessionPath = path.join(sessionsDir, sessionName);
    
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      browser: ['SIMON TECH BOT2', 'Windows', '1.0'],
      qrTimeout: 60000,
      logger: {
        level: 'error',
        log: () => {},
      },
    });

    // Store socket reference
    activeSockets.set(chatId, sock);

    // Wait for connection to initialize
    await new Promise((resolve) => {
      setTimeout(resolve, 2000);
    });

    // Request REAL pairing code from WhatsApp
    try {
      const code = await sock.requestPairingCode(phoneNumber);

      if (code) {
        // Store session info
        const userSession = {
          phoneNumber,
          country: detectCountry(phoneNumber),
          pairingCode: code, // REAL code from WhatsApp
          status: 'code_generated',
          sessionName,
        };
        
        userSessions.set(chatId, userSession);

        // Display the REAL pairing code
        const responseMessage = `
╰┈➤ ɢᴇɴᴇʀᴀᴛɪɴɢ ᴘᴀɪʀ ᴄᴏᴅᴇ 👀

[ ♡ SIMON TECH BOT2 👀 ]

╰┈➤ ɴᴜᴍʙᴇʀ : ${phoneNumber}

╰┈➤ ᴄᴏᴜɴᴛʀʏ : ${userSession.country}

╰┈➤ ᴄᴏᴅᴇ : ${code}

[ Sᴇssɪᴏɴ Cᴏɴɴᴇᴄᴛɪɴɢ. ❤️‍🩹 ]

⏳ Waiting for WhatsApp linking confirmation...

💡 Steps:
1️⃣ Go to WhatsApp on your phone
2️⃣ Go to Settings → Linked Devices
3️⃣ Click "Link a Device"
4️⃣ Enter the pairing code: ${code}
5️⃣ Confirm on your phone

⚠️ This code expires in 60 seconds
`;

        await bot.sendMessage(chatId, responseMessage);

        // Listen for connection
        sock.ev.on('connection.update', async (update) => {
          const { connection } = update;

          if (connection === 'open') {
            console.log(`✅ WhatsApp connected for ${phoneNumber}`);

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

            const session = userSessions.get(chatId);
            if (session) {
              session.status = 'connected';
            }

            // Close the socket after connection
            setTimeout(() => {
              sock.end(new Error('Closed'));
              activeSockets.delete(chatId);
            }, 5000);
          }
        });

        sock.ev.on('creds.update', saveCreds);

      } else {
        await bot.sendMessage(chatId, '❌ Failed to generate pairing code. Please try again.');
      }

    } catch (pairingError) {
      console.error('Pairing error:', pairingError);
      
      // Try QR code as fallback
      sock.ev.on('connection.update', async (update) => {
        const { qr, connection } = update;

        if (qr) {
          console.log('Fallback: QR Code generated');
          await bot.sendMessage(
            chatId,
            '❌ Could not generate phone pairing code.\n\n⚠️ Alternative: Please use the web session generator at:\nhttps://your-deployment-url.com\n\nThen scan the QR code with WhatsApp camera.'
          );
        }

        if (connection === 'open') {
          const session = userSessions.get(chatId);
          if (session) {
            session.status = 'connected';
          }

          await bot.sendMessage(chatId, '✅ WhatsApp connected via QR code!');

          setTimeout(() => {
            sock.end(new Error('Closed'));
            activeSockets.delete(chatId);
          }, 5000);
        }
      });
    }

    sock.ev.on('creds.update', saveCreds);

  } catch (error) {
    console.error('WhatsApp session error:', error);
    
    await bot.sendMessage(
      chatId,
      `❌ Error: ${error.message}\n\nPlease ensure:\n• Your phone number is correct\n• WhatsApp is installed and updated\n• Your phone is connected to the internet`
    );
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
3️⃣ You'll get a REAL 8-digit pairing code
4️⃣ Enter it in WhatsApp Linked Devices
5️⃣ Connection confirmed!

⚠️ Important:
• Phone number must include country code
• Pairing code expires after 60 seconds
• Code is generated by WhatsApp servers
• Your account will be automatically linked
• Never share your phone number

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

${session.pairingCode ? `╰┈➤ ᴄᴏᴅᴇ : ${session.pairingCode}` : ''}
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
  
  // Close active socket
  if (activeSockets.has(chatId)) {
    const sock = activeSockets.get(chatId);
    sock.end(new Error('Reset'));
    activeSockets.delete(chatId);
  }
  
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

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  activeSockets.forEach((sock) => {
    sock.end(new Error('Shutdown'));
  });
  process.exit(0);
});

// Server startup
console.log('✅ SIMON TECH BOT2 - Telegram Interface Started');
console.log('🤖 Bot is running and waiting for messages...');
console.log('📱 Make sure TELEGRAM_TOKEN is set in environment variables');
