const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('moveall')
        .setDescription('Moves all users from one VC to another')
        .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers)
        .addChannelOption(option =>
            option.setName('from')
                .setDescription('The source voice channel')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('to')
                .setDescription('The destination voice channel')
                .setRequired(true)),

    async execute(interaction) {
        const sourceVC = interaction.options.getChannel('from');
        const targetVC = interaction.options.getChannel('to');

        // Check if both channels are actually voice channels
        if (!sourceVC.isVoiceBased() || !targetVC.isVoiceBased()) {
            return interaction.reply({ content: 'Both channels must be Voice Channels!', ephemeral: true });
        }

        const membersToMove = sourceVC.members;

        if (membersToMove.size === 0) {
            return interaction.reply({ content: `No users are currently in ${sourceVC.name}.`, ephemeral: true });
        }

        await interaction.deferReply();

        let movedCount = 0;
        for (const [id, member] of membersToMove) {
            try {
                await member.voice.setChannel(targetVC);
                movedCount++;
            } catch (error) {
                console.error(`Failed to move ${member.user.tag}:`, error);
            }
        }

        return interaction.editReply(`Successfully moved ${movedCount} member(s) from **${sourceVC.name}** to **${targetVC.name}**.`);
    },
};
