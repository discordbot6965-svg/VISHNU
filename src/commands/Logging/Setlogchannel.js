const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
    ]
});

// Replace with your actual channel ID where logs should be sent
const LOG_CHANNEL_ID = 'YOUR_LOG_CHANNEL_ID'; 

client.on('voiceStateUpdate', async (oldState, newState) => {
    const logChannel = newState.guild.channels.cache.get(LOG_CHANNEL_ID);
    if (!logChannel) return;

    const member = newState.member || oldState.member;
    const user = member.user;

    // 1. User Joined a Voice Channel
    if (!oldState.channelId && newState.channelId) {
        const joinEmbed = new EmbedBuilder()
            .setColor('#2b2d31') // Dark embed background color
            .setAuthor({ 
                name: 'Joined Voice Channel', 
                iconURL: 'https://cdn-icons-png.flaticon.com/512/59/59284.png' // Voice channel icon
            })
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: 'User', value: `${user} (${user.tag})` },
                { name: 'Channel', value: `🔊 **${newState.channel.name}**` },
                { name: 'Channel ID', value: `\`${newState.channelId}\`` }
            )
            .setFooter({ 
                text: `Event logged by ${client.user.username}`, 
                iconURL: client.user.displayAvatarURL() 
            })
            .setTimestamp();

        logChannel.send({ embeds: [joinEmbed] });
    }

    // 2. User Left a Voice Channel
    else if (oldState.channelId && !newState.channelId) {
        const leaveEmbed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setAuthor({ 
                name: 'Left Voice Channel', 
                iconURL: 'https://cdn-icons-png.flaticon.com/512/59/59284.png' 
            })
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: 'User', value: `${user} (${user.tag})` },
                { name: 'Channel', value: `🔊 **${oldState.channel.name}**` },
                { name: 'Channel ID', value: `\`${oldState.channelId}\`` }
            )
            .setFooter({ 
                text: `Event logged by ${client.user.username}`, 
                iconURL: client.user.displayAvatarURL() 
            })
            .setTimestamp();

        logChannel.send({ embeds: [leaveEmbed] });
    }

    // 3. User Switched Voice Channels
    else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
        const switchEmbed = new EmbedBuilder()
            .setColor('#2b2d31')
            .setAuthor({ 
                name: 'Switched Voice Channel', 
                iconURL: 'https://cdn-icons-png.flaticon.com/512/59/59284.png' 
            })
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: 'User', value: `${user} (${user.tag})` },
                { name: 'From', value: `🔊 **${oldState.channel.name}** (\`${oldState.channelId}\`)` },
                { name: 'To', value: `🔊 **${newState.channel.name}** (\`${newState.channelId}\`)` }
            )
            .setFooter({ 
                text: `Event logged by ${client.user.username}`, 
                iconURL: client.user.displayAvatarURL() 
            })
            .setTimestamp();

        logChannel.send({ embeds: [switchEmbed] });
    }
});

client.login('YOUR_BOT_TOKEN');
