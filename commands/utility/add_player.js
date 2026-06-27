// /add_player ("Adds a player to the server leaderboard")

const { SlashCommandBuilder, MessageFlags, PermissionsBitField } = require("discord.js");
const path = require("path");
const chars = require(path.join(process.cwd(), "/datasets/chars/chars.json"));
const fetch = require(path.join(process.cwd(), "/fetch_player.js"));

module.exports = {
  data: new SlashCommandBuilder()
    .setName("add_player")
    .setDescription("Adds a player to the server leaderboard")
    .addIntegerOption((option) =>
      option
        .setName("board_index")
        .setDescription(
          "The index of the board that you want to edit (maximum of 9)",
        )
        .setMinValue(1)
        .setMaxValue(9)
        .setRequired(true),

    )
    .addStringOption((option) =>
      option
        .setName("id")
        .setDescription(
          "Player's puddle-farm ID. Get this from their puddle-farm profile by copying the number in the URL",
        )
        .setRequired(true)
        .setMaxLength(24),
    )
    .addStringOption((option) =>
      option
        .setName("character")
        .setDescription(
          "Player's character. Use the two letter short name used by puddle-farm (ie: SO for Sol)",
        )
        .setRequired(true)
        .setMaxLength(2),
    )
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription(
          "Player's display name (max of 32 characters, will default to in-game name if no input is given)",
        )
        .setRequired(false)
        .setMaxLength(32),
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
      let valid_char = false;
      for (let i in chars) {
        if (
          chars[i][0] ==
          interaction.options.getString("character").toUpperCase()
        ) {
          valid_char = true;
          break;
        }
      }
      if (!valid_char) {
        await interaction.reply({
          content: "Oops! That wasn't a valid character!",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      await fetch(
        interaction.options.getInteger("board_index"),
        interaction.options.getString("name"),
        interaction.options.getString("id"),
        interaction.options.getString("character").toUpperCase(),
        interaction.guild.id,
      );
      await interaction.reply({
        content: "Added the chosen player to the leaderboard!",
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
