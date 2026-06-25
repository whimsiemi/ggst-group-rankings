// /edit_player ("Edit a player's display name or main")
const { SlashCommandBuilder, MessageFlags, PermissionsBitField } = require("discord.js");
const path = require("path");
const chars = require(path.join(process.cwd(), "/datasets/chars/chars.json"));
const fetch = require(path.join(process.cwd(), "/fetch_player.js"));

module.exports = {
  data: new SlashCommandBuilder()
    .setName("edit_player")
    .setDescription("Edit a player's display name or main")
    .addStringOption((option) =>
      option
        .setName("id")
        .setDescription("The puddle-farm ID of the user being edited")
        .setRequired(true)
        .setMaxLength(24),
    )
    .addStringOption((option) =>
      option
        .setName("entry")
        .setDescription(
          "The specific character entry to be edited (for those with multiple characters on the leaderboard)",
        )
        .setRequired(false)
        .setMaxLength(2),
    )
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription(
          "Change the player's display name (max of 16 characters)",
        )
        .setRequired(false)
        .setMaxLength(16),
    )
    .addStringOption((option) =>
      option
        .setName("character")
        .setDescription(
          "Change the player's character (remember to use the two letter short name used by puddle-farm)",
        )
        .setRequired(false)
        .setMaxLength(2),
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
      let name = "";
      if (interaction.options.getString("name") != null) {
        name = interaction.options.getString("name");
      }
      let entry = "";
      if (interaction.options.getString("entry") != null) {
        entry = interaction.options.getString("entry");
        let valid_entry = false;
        let serv_array = [];
        try {
          serv_array = require(
            path.join(
              process.cwd(),
              "/datasets/" + interaction.guild.id + ".json",
            ),
          );
        } catch (_err) {
          console.log("Can't find json!");
          serv_array = [];
        }
        for (let i in serv_array) {
          if (
            serv_array[i].id == interaction.options.getString("id") &&
            serv_array[i].main == entry.toUpperCase()
          ) {
            valid_entry = true;
            name == serv_array[i].name;
            break;
          }
        }
        if (!valid_entry) {
          await interaction.reply({
            content: "Oops! That wasn't a valid character entry!",
            flags: MessageFlags.Ephemeral,
          });
          return;
        }
      }
      let char = "";
      if (interaction.options.getString("character") != null) {
        char = interaction.options.getString("character");
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
      }
      await fetch(
        name,
        interaction.options.getString("id"),
        char.toUpperCase(),
        interaction.guild.id,
        entry.toUpperCase(),
      );
      await interaction.reply({
        content: "Edited the chosen player!",
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
