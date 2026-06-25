// /delete_player ("Removes a player from the server leaderboard")

const { SlashCommandBuilder, MessageFlags } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!"),
  async execute(interaction) {
    await interaction.reply({content: "Pong!", flags: MessageFlags.Ephemeral});
  },
};
