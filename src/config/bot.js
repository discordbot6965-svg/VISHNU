const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Settings & State
const CONFIG = {
    TOKEN: 'YOUR_BOT_TOKEN_HERE',
    PREFIX: '!',
    OWNER_IDS: ['YOUR_DISCORD_USER_ID']
};

let antiSpamEnabled = true; // Enabled by default
const userMessageMap = new Map();

// Configuration limits
const SPAM_LIMIT = 5;            // Max messages
const TIME_FRAME = 5000;         // Within 5 seconds (in ms)
const TIMEOUT_MINUTES = 10;     // Penalty duration

client.once('ready', () => {
    console.log(`Bot online as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    // --- 1. TOGGLE COMMAND HANDLER ---
    if (message.content.startsWith(CONFIG.PREFIX)) {
        const args = message.content.slice(CONFIG.PREFIX.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        if (command === 'antispam') {
            // Check owner permissions
            if (!CONFIG.OWNER_IDS.includes(message.author.id)) {
                return; // Silent ignore for non-owners
            }

            const option = args[0]?.toLowerCase();

            if (option === 'on' || option === 'enable') {
                antiSpamEnabled = true;
                return message.reply('🛡️ **Anti-Spam protection has been ENABLED.**');
            } 
            
            if (option === 'off' || option === 'disable') {
                antiSpamEnabled = false;
                userMessageMap.clear(); // Clear cached tracking data
                return message.reply('⚠️ **Anti-Spam protection has been DISABLED.**');
            }

            // Command Usage Info
            return message.reply(
                `⚙️ **Anti-Spam Status:** \`${antiSpamEnabled ? 'ENABLED' : 'DISABLED'}\`\n` +
                `**Usage:** \`${CONFIG.PREFIX}antispam <on/off>\``
            );
        }
    }

    // --- 2. AUTOMATIC SPAM DETECTION ---
    if (!antiSpamEnabled) return; // Skip checking if feature is turned off

    const userId = message.author.id;
    const now = Date.now();

    // Get or initialize timestamp list for user
    let userData = userMessageMap.get(userId) || { timestamps: [] };

    // Filter out old timestamps outside the window
    userData.timestamps = userData.timestamps.filter(ts => now - ts < TIME_FRAME);
    userData.timestamps.push(now);
    userMessageMap.set(userId, userData);

    // Trigger action if threshold exceeded
    if (userData.timestamps.length >= SPAM_LIMIT) {
        const member = message.member;

        if (member && member.moderatable) {
            try {
                userMessageMap.delete(userId); // Reset counter

                const durationMs = TIMEOUT_MINUTES * 60 * 1000;
                await member.timeout(durationMs, 'Automated Anti-Spam Command Trigger');

                await message.channel.send(
                    `🛑 **${message.author.tag}** was automatically timed out for **${TIMEOUT_MINUTES} minutes** for spamming.`
                );
            } catch (error) {
                console.error('Failed to timeout spammer:', error);
            }
        }
    }
});

client.login(CONFIG.TOKEN);
