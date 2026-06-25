// /post_board ("Sends the player leaderboard, which is updated every 24 hours or when requested")

const { SlashCommandBuilder, MessageFlags } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!"),
  async execute(interaction) {
    await interaction.reply({content: "Pong!", flags: MessageFlags.Ephemeral});
  },
};
