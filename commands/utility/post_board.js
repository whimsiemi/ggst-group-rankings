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

module.exports = {
  data: new SlashCommandBuilder()
    .setName("post_board")
    .setDescription(
      "Sends the player leaderboard, which is updated every 24 hours or when requested",
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
    )
    .addStringOption((option) =>
      option
        .setName("name")
        .setDescription("The name of your leaderboard")
        .setMaxLength(256)
        .setRequired(true),
    )
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel to send the leaderboard to")
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
    if(!interaction.guild.members.me.permissionsIn(interaction.options.getChannel("channel")).has([ PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages ])) {
      await interaction.reply({
        content:
          "The bot doesn't have permissions to send messages in that channel! Make sure that the bot has the `Send Messages` and `View Channel` permissions in said channel or try a different channel.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    try {
      await interaction.reply({
        content:
          "Posting the leaderboard! This usually takes 0.5 seconds per player (or longer, if the server CPU is under heavy load). If nothing gets sent after 5 minutes, contact the bot developer!",
        flags: MessageFlags.Ephemeral,
      });
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
              link:
                "https://puddle.farm/player/" +
                array[i].id +
                "/" +
                response.data.ratings[char_index].char_short,
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
        .setFooter({
          text:
            "Board index: " +
            interaction.options.getInteger("board_index").toString(),
        })
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
          path.join(process.cwd(), "/datasets/" + filename + ".json"),
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
