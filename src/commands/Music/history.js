import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
    category: 'Music',
    data: new SlashCommandBuilder()
        .setName('history')
        .setDescription('Shows the history of previously played songs in this server'),

    async execute(interaction, config, client) {
        // Find the Lavalink player for this guild
        const player = client.manager?.get?.(interaction.guildId) 
                    || client.lavalink?.players?.get?.(interaction.guildId)
                    || client.music?.getPlayer?.(interaction.guildId);

        if (!player || !player.history || player.history.length === 0) {
            return interaction.reply({
                content: '❌ There is no playback history for this session yet.',
                ephemeral: true
            });
        }

        const historyList = player.history.slice(0, 10).map((track, index) => {
            const minutes = Math.floor(track.duration / 60000);
            const seconds = Math.floor((track.duration % 60000) / 1000).toString().padStart(2, '0');
            return `**${index + 1}.** [${track.title}](${track.uri}) - \`${minutes}:${seconds}\` (by *${track.author}*)`;
        }).join('\n');

        const embed = new EmbedBuilder()
            .setTitle('📜 Music Playback History')
            .setColor(0x0099FF)
            .setDescription(historyList)
            .setFooter({ text: `Showing last ${Math.min(player.history.length, 10)} played tracks` })
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    },
};
