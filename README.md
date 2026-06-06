# SIMON TECH BOT2

A powerful multi-feature Telegram and WhatsApp bot with 800+ commands for automation, entertainment, and productivity.

## 🌟 Features

- ✅ **Telegram Bot Interface** - Command-based control via Telegram
- ✅ **WhatsApp Integration** - Real pairing code generation & connection
- ✅ **800+ Commands** across 19 categories:
  - 👑 Owner (50 commands)
  - ⚙️ System (50 commands)
  - 🧠 AI (100 commands)
  - 📥 Download (80 commands)
  - 🖼️ Media (60 commands)
  - 🎮 Games (80 commands)
  - 💰 Economy (80 commands)
  - 👥 Group Management (80 commands)
  - 🔐 Security (60 commands)
  - And more!
- ✅ **Multi-Device Support** - Connect multiple WhatsApp accounts
- ✅ **Session Management** - Automatic credential storage
- ✅ **Country Detection** - Auto-detect location from phone number
- ✅ **Error Handling** - Robust error management & logging

## 🚀 Quick Start

### Prerequisites
- Node.js >= 16.0.0
- npm or yarn
- Telegram Bot Token (from [@BotFather](https://t.me/botfather))
- WhatsApp account

### Installation

1. **Clone & Navigate:**
```bash
git clone https://github.com/logintiktok427-cmyk/SIMON-TECH-bot2.git
cd SIMON-TECH-bot2
```

2. **Install Dependencies:**
```bash
npm install
```

3. **Configure Environment:**
```bash
cp .env.example .env
# Edit .env and add your TELEGRAM_TOKEN
```

4. **Start the Bot:**
```bash
npm start
```

## 📖 Usage Guide

### In Telegram:
1. Start bot: `/start`
2. Send your WhatsApp phone number with country code
   - Format: `+1234567890`
   - Examples: `+1` (USA), `+234` (Nigeria), `+44` (UK), `+91` (India)
3. Receive 8-digit pairing code
4. Enter code in WhatsApp → Settings → Linked Devices → Link a Device
5. Once connected, use `.menu` to view all commands

### Basic Commands:
```
.menu      - Show all available commands
.help      - Display help information
.ping      - Check bot response time
.alive     - View bot status & uptime
/start     - Start linking process
/status    - Check session status
/reset     - Reset and start over
```

## 🛠️ Development

For development with auto-reload:
```bash
npm run dev
```

This uses `nodemon` to automatically restart the bot when files change.

## 🌐 Deployment

### Heroku Deployment

1. **Create Heroku Account** and install CLI
2. **Login:**
   ```bash
   heroku login
   ```

3. **Create App:**
   ```bash
   heroku create your-app-name
   ```

4. **Set Environment Variable:**
   ```bash
   heroku config:set TELEGRAM_TOKEN=your_telegram_bot_token
   ```

5. **Deploy:**
   ```bash
   git push heroku main
   ```

6. **View Logs:**
   ```bash
   heroku logs --tail
   ```

### Railway Deployment

1. Go to [railway.app](https://railway.app)
2. Create new project → Deploy from GitHub
3. Connect your repository
4. Add `TELEGRAM_TOKEN` environment variable
5. Deploy automatically

### Other Platforms

Ensure your platform supports Node.js (16+) and set the `TELEGRAM_TOKEN` environment variable.

## 📁 Project Structure

```
SIMON-TECH-bot2/
├── index.js                 # Main bot application
├── package.json             # Dependencies & scripts
├── .env.example             # Environment variables template
├── .gitignore              # Git ignore rules
├── Procfile                # Heroku deployment config
├── README.md               # Documentation
└── sessions/               # WhatsApp session storage (auto-created)
```

## 🔧 Configuration

Edit `.env` file for custom settings:

```env
# Required
TELEGRAM_TOKEN=your_telegram_bot_token

# Optional (can be modified in code)
BOT_PREFIX=.
BOT_NAME=SIMON TECH BOT2
BOT_VERSION=2.0.0
```

## 🐛 Troubleshooting

### Bot Not Responding in Telegram
- Verify `TELEGRAM_TOKEN` is correct
- Check internet connection
- Restart the bot: `npm start`

### WhatsApp Connection Fails
- Ensure phone number format: `+CountryCodeNumber`
- Verify WhatsApp is installed and updated on phone
- Check that pairing code hasn't expired (60 seconds)
- Ensure phone has active internet connection

### "Phone number is invalid"
- Add country code (e.g., `+1` for USA)
- Remove spaces or special characters
- Valid format: `+1234567890` (10-14 digits after `+`)

### Deployment Issues
- Confirm all files in git: `git status`
- Check build logs on platform
- Verify Node.js version compatibility
- Ensure `package.json` exists with proper format

## 📊 Command Categories

| Category | Commands | Description |
|----------|----------|-------------|
| Owner | 50 | Admin controls, backup, deployment |
| System | 50 | Bot info, status, performance |
| AI | 100 | Chat, code generation, analysis |
| Download | 80 | YouTube, TikTok, Instagram |
| Media | 60 | Stickers, effects, conversion |
| Games | 80 | Entertainment & gaming |
| Economy | 80 | Virtual currency system |
| Group | 80 | Group management & moderation |
| Security | 60 | Protection & threat detection |
| And 10+ more categories! | 300+ | Various utilities |

## 🔐 Security

- Never share your `.env` file
- Keep `TELEGRAM_TOKEN` secret
- Don't commit `.env` to git (use `.gitignore`)
- Regenerate WhatsApp sessions if compromised
- Use `.env.example` as template

## 📝 License

ISC - Feel free to use and modify

## 👨‍💻 Author

**SIMON TECH**

## 🤝 Support

For issues, questions, or feature requests:
- Open a [GitHub Issue](https://github.com/logintiktok427-cmyk/SIMON-TECH-bot2/issues)
- Contact: [@simontech_official](https://t.me/simontech_official)

## ⭐ Show Your Support

If this project helped you, please:
- ⭐ Star this repository
- 🍴 Fork & contribute
- 📢 Share with others
- 💬 Provide feedback

---

**Made with 💻 and ❤️ by SIMON TECH**

🚀 Happy Botting! 🤖
