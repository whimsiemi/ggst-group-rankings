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
    )
    .addIntegerOption((option) =>
      option
        .setName("board_index")
        .setDescription(
          "The index of the board that you want to edit (maximum of 9)",
        )
        .setMinValue(1)
        .setMaxValue(9)
        .setRequired(true),

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
        let filename = interaction.guild.id
        if (interaction.options.getInteger("board_index") > 1) {
            filename = interaction.guild.id + "_" + interaction.options.getInteger("board_index").toString();
        } 
      fs.unlink(
        path.join(process.cwd(), "/datasets/" + filename + ".json"),
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
