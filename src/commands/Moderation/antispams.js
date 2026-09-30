const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const CONFIG = {
    TOKEN: 'YOUR_BOT_TOKEN_HERE',
    PREFIX: '!',
    OWNER_IDS: ['YOUR_DISCORD_USER_ID']
};

client.once('ready', () => {
    console.log(`Bot online as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild || !message.content.startsWith(CONFIG.PREFIX)) return;

    const args = message.content.slice(CONFIG.PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // Command: !antispam @user [duration_in_minutes]
    if (command === 'antispam') {
        // 1. Owner Check (Silent fail for non-owners)
        if (!CONFIG.OWNER_IDS.includes(message.author.id)) return;

        // 2. Mention Check
        const targetMember = message.mentions.members.first();
        if (!targetMember) {
            return message.reply('⚠️ **Usage**: `!antispam @user [minutes]`');
        }

        const durationMinutes = parseInt(args[1], 10) || 10; // Defaults to 10 minutes

        if (!targetMember.moderatable) {
            return message.reply('❌ Cannot action this user due to role hierarchy or permissions.');
        }

        try {
            // Fetch recent 50 messages from the channel
            const messages = await message.channel.messages.fetch({ limit: 50 });
            
            // Filter user's messages sent within the last 10 seconds
            const now = Date.now();
            const userRecentMessages = messages.filter(
                m => m.author.id === targetMember.id && (now - m.createdTimestamp) < 10000
            );

            // Check if user has 3 or more messages in those 10 seconds
            if (userRecentMessages.size >= 3) {
                // Delete the spam messages
                await message.channel.bulkDelete(userRecentMessages).catch(() => {});

                // Apply timeout
                const durationMs = durationMinutes * 60 * 1000;
                await targetMember.timeout(durationMs, 'Manual Anti-Spam Trigger');

                return message.channel.send(
                    `🛑 **${targetMember.user.tag}** detected spamming (${userRecentMessages.size} msgs in 10s) and timed out for **${durationMinutes} minute(s)**.`
                );
            } else {
                return message.reply(`ℹ️ **${targetMember.user.tag}** has not met the spam threshold (fewer than 3 messages in the last 10 seconds).`);
            }
        } catch (error) {
            console.error(error);
            return message.reply('❌ Error executing anti-spam command.');
        }
    }
});

client.login(CONFIG.TOKEN);
