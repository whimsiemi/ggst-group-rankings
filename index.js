// Starts up the bot (pretty self-explanatory)

const fs = require("node:fs");
const path = require("node:path");
const axios = require("axios");
const emojis = require(path.join(process.cwd(), "/emojis.json"));

const {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  MessageFlags,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  PermissionsBitField,
} = require("discord.js");
const { token } = require("./config.json");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.cooldowns = new Collection();
client.commands = new Collection();
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
      );
    }
  }
}

const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

client.on(Events.InteractionCreate, async (interaction) => {
  const { cooldowns } = client;

  // 3. Define the cooldown duration (Default: 3 seconds if not defined in the command file)
  const defaultCooldownDuration = 10;
  const cooldownAmount = defaultCooldownDuration * 1000;
  if (interaction.isButton()) {
    if (!cooldowns.has(interaction.customId)) {
      cooldowns.set(interaction.customId, new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(interaction.customId);

    if (timestamps.has(interaction.user.id)) {
      const expirationTime =
        timestamps.get(interaction.user.id) + cooldownAmount;

      if (now < expirationTime) {
        const timeLeft = Math.round((expirationTime - now) / 1000);

        return interaction.reply({
          content: "Whoa! Slow down and wait **${timeLeft}** more second(s) before pressing the button!.",
          flags: MessageFlags.Ephemeral,
        });
      }
    }

    timestamps.set(interaction.user.id, now);

    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
    if (interaction.customId == "update") {
      if (
        !interaction.member.permissions.has(
          PermissionsBitField.Flags.ManageGuild,
        )
      ) {
        await interaction.reply({
          content:
            "Stop right there, you criminal scum! You can't run that command!",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
      await interaction.reply({
        content:
          "Updating the leaderboard! Please wait a few seconds. If nothing gets updated, contact the bot developer!",
        flags: MessageFlags.Ephemeral,
      });
      try {
        let array = [];
        array = require(
          path.join(
            process.cwd(),
            "/datasets/" + interaction.guild.id + ".json",
          ),
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
          var emoji = "1519808417013698682";
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
          .setColor(interaction.message.embeds[0].color)
          .setTitle(interaction.message.embeds[0].title)
          .setDescription(ranking_txt)
          .setTimestamp();

        const update = new ButtonBuilder()
          .setCustomId("update")
          .setLabel("Refresh")
          .setStyle(ButtonStyle.Primary);
        const buttons = new ActionRowBuilder().addComponents(update);

        interaction.message.edit({
          embeds: [leaderboardEmbed],
          components: [buttons],
        });
        delete require.cache[
          require.resolve(
            path.join(
              process.cwd(),
              "/datasets/" + interaction.guild.id + ".json",
            ),
          )
        ];
      } catch (err) {
        console.log("Error! Probably because the board was deleted lmfao");
      }
    }
  } else if (interaction.isChatInputCommand()) {
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(
        `No command matching ${interaction.commandName} was found.`,
      );
      return;
    }

    if (!cooldowns.has(interaction.commandName)) {
      cooldowns.set(interaction.commandName, new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(interaction.commandName);

    if (timestamps.has(interaction.user.id)) {
      const expirationTime =
        timestamps.get(interaction.user.id) + cooldownAmount;

      if (now < expirationTime) {
        const timeLeft = Math.round((expirationTime - now) / 1000);

        return interaction.reply({
          content: "Whoa! Slow down and wait **${timeLeft}** more second(s) before pressing the button!.",
          flags: MessageFlags.Ephemeral,
        });
      }
    }

    timestamps.set(interaction.user.id, now);

    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "There was an error while executing this command!",
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await interaction.reply({
          content: "There was an error while executing this command!",
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  }
});

client.login(token);
