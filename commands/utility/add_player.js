// /add_player ("Adds a player to the server leaderboard")

const { SlashCommandBuilder, MessageFlags } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!"),
  async execute(interaction) {
    await interaction.reply({content: "Pong!", flags: MessageFlags.Ephemeral});
  },
};
