// /post_board ("Sends the player leaderboard, which is updated every 24 hours or when requested")

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
const axios = require("axios");
const emojis = require(path.join(process.cwd(), "/emojis.json"));
const board = require(path.join(process.cwd(), "/strive_board.js"));

module.exports = {
  data: new SlashCommandBuilder()
    .setName("post_board")
    .setDescription(
      "Sends the player leaderboard, which is updated every 24 hours or when requested",
    )
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("The name of your leaderboard")
        .setMaxLength(256),
    )
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel to send the leaderboard to"),
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
      await interaction.reply({
        content:
          "Posting the leaderboard! Please wait a few seconds. If nothing gets sent, contact the bot developer!",
        flags: MessageFlags.Ephemeral,
      });
      let array = [];
      array = require(
        path.join(process.cwd(), "/datasets/" + interaction.guild.id + ".json"),
      );
      let ranking_arr = [];
      let ranking_txt = "";
      for (let i in array) {
        await axios
          .get("https://puddle.farm/api/player/" + array[i].id)
          .then((response) => {
            function get_char_index() {
              for (let j in response.data.ratings) {
                if (response.data.ratings[j].char_short == array[i].main)
                  return j;
              }
            }
            let char_index = get_char_index();
            ranking_arr.push({
              name: array[i].name,
              link: "https://puddle.farm/player/" + array[i].id,
              char: response.data.ratings[char_index].character,
              char_short: response.data.ratings[char_index].char_short,
              rating: response.data.ratings[char_index].rating,
            });
          });
      }
      ranking_arr.sort((a, b) => b.rating - a.rating);
      for (let i in ranking_arr) {
        let ranking = "";
        if (
          ranking_arr[i].rating.toString().startsWith("1000") &&
          ranking_arr[i].rating.toString().length > 5
        ) {
          ranking = ranking_arr[i].rating.toString().slice(4) + " DR";
        } else {
          ranking = ranking_arr[i].rating + " RP";
        }
        var emoji = "1519802004787036170";
        for (let j in emojis) {
          if (emojis[j][0] == ranking_arr[i].char_short) {
            emoji = emojis[j][1];
            break;
          }
        }
        ranking_txt +=
          i +
          1 +
          ". <:GG_" +
          ranking_arr[i].char_short +
          ":" +
          emoji +
          "> " +
          "[" +
          ranking_arr[i].name +
          "](" +
          ranking_arr[i].link +
          ") (" +
          ranking_arr[i].char +
          ", " +
          ranking +
          ")\n";
      }
      const leaderboardEmbed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(interaction.options.getString("name"))
        .setDescription(ranking_txt)
        .setTimestamp();

      const update = new ButtonBuilder()
        .setCustomId("update")
        .setLabel("Refresh")
        .setStyle(ButtonStyle.Primary);
      const buttons = new ActionRowBuilder().addComponents(update);

      interaction.options
        .getChannel("channel")
        .send({ embeds: [leaderboardEmbed], components: [buttons] });
      delete require.cache[
        require.resolve(
          path.join(
            process.cwd(),
            "/datasets/" + interaction.guild.id + ".json",
          ),
        )
      ];
    } catch (_err) {
      await interaction.reply({
        content: "Oops! There was an error!",
        flags: MessageFlags.Ephemeral,
      });
      console.log(_err);
    }
  },
};
