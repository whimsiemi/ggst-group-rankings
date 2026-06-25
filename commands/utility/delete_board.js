const {
  SlashCommandBuilder,
  MessageFlags,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  PermissionsBitField,
} = require("discord.js");
const path = require("path");
const fs = require("fs");
const axios = require("axios");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("delete_board")
    .setDescription(
      "Deletes the player board (does not remove the embed message! Do this manually)",
    ),
  async execute(interaction) {
    if (
      !interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)
    ) {
      await interaction.reply({
        content:
          "Stop right there, you criminal scum! You can't run that command!",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    try {
      fs.unlink(
        path.join(process.cwd(), "/datasets/" + interaction.guild.id + ".json"),
        (err) => {
          if (err) {
            console.error("Error deleting file:", err);
            return;
          }
          console.log("File deleted successfully!");
        },
      );
      await interaction.reply({
        content: "Deleted the board!",
        flags: MessageFlags.Ephemeral,
      });
    } catch (_err) {
      await interaction.reply({
        content: "Oops! There was an error!",
        flags: MessageFlags.Ephemeral,
      });
      console.log(_err);
    }
  },
};
