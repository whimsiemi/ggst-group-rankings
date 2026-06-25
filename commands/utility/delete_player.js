// /delete_player ("Removes a player from the server leaderboard")

const { SlashCommandBuilder, MessageFlags, PermissionsBitField } = require("discord.js");
const path = require("path");
const fs = require("fs");
const chars = require(path.join(process.cwd(), "/datasets/chars/chars.json"));

module.exports = {
  data: new SlashCommandBuilder()
    .setName("delete_player")
    .setDescription("Removes a player from the server leaderboard")
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
        .setDescription("The puddle-farm ID of the user being deleted")
        .setRequired(true)
        .setMaxLength(24),
    )
    .addStringOption((option) =>
      option
        .setName("entry")
        .setDescription("The specific character entry to be deleted (for those with multiple characters on the leaderboard)")
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
      let array = [];
      let filename = interaction.guild.id;
      if (interaction.options.getInteger("board_index") > 1) {
        filename =
          interaction.guild.id +
          "_" +
          interaction.options.getInteger("board_index").toString();
      }
      array = require(
        path.join(process.cwd(), "/datasets/" + filename + ".json"),
      );
      for (let i in array) {
        if (array[i].id == interaction.options.getString("id")) {
          if (interaction.options.getString("entry") != "" && interaction.options.getString("entry") != null) {
            if (array[i].main == interaction.options.getString("entry"))
            {
              array.splice(i, 1);
              break;
            }
          }
          else {
            array.splice(i, 1);
            break;
          }
        }
      }
      fs.writeFile(
        "./datasets/" + filename + ".json",
        JSON.stringify(array, null, "\t"),
        "utf8",
        (err) => {
          if (err) {
            console.error("Error writing file:", err);
            return;
          }
          console.log("File written successfully!");
        },
      );
      await interaction.reply({
        content: "Deleted the chosen player!",
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
