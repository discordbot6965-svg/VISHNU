const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { useMainPlayer } = require('discord-player'); // Or your audio library

module.exports = {
  data: new SlashCommandBuilder()
    .setName('playlist-create')
    .setDescription('Create a new playlist and add a song by name')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('Name of the playlist')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('song')
        .setDescription('Song name or URL to add (leave blank to save current queue)')
        .setRequired(false)),

  async execute(interaction) {
    await interaction.deferReply();

    const playlistName = interaction.options.getString('name').toLowerCase();
    const songQuery = interaction.options.getString('song');
    const userId = interaction.user.id;

    // Initialize user's playlist storage if it doesn't exist
    if (!playlists.has(userId)) {
      playlists.set(userId, new Map());
    }
    const userPlaylists = playlists.get(userId);

    // If playlist doesn't exist, create an empty array for tracks
    if (!userPlaylists.has(playlistName)) {
      userPlaylists.set(playlistName, []);
    }
    const currentPlaylist = userPlaylists.get(playlistName);

    // Track addition logic
    let addedSongs = [];

    if (songQuery) {
      // Option A: Add specific song by name/search
      currentPlaylist.push(songQuery);
      addedSongs.push(songQuery);
    } else {
      // Option B: Grab current voice queue if no song was specified
      const player = useMainPlayer();
      const queue = player.nodes.get(interaction.guildId);

      if (!queue || !queue.tracks.data.length) {
        return interaction.editReply('❌ No song query provided and no active queue found!');
      }

      // Add current track + queued tracks
      if (queue.currentTrack) currentPlaylist.push(queue.currentTrack.title);
      queue.tracks.data.forEach(track => currentPlaylist.push(track.title));
      addedSongs = currentPlaylist;
    }

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle(`📁 Playlist Created: "${playlistName}"`)
      .setDescription(
        songQuery 
          ? `Added **${songQuery}** to playlist.`
          : `Saved **${addedSongs.length} tracks** from the current queue.`
      )
      .setFooter({ text: `Total songs in playlist: ${currentPlaylist.length}` });

    return interaction.editReply({ embeds: [embed] });
  },
};
