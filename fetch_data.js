// Necessary first-time installation script to fetch the required matchup data. In the future, I'll just make the index.js script do this script's job

const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const axios = require("axios");
const fs = require("fs");

async function fetch_characters() {
  dir = "./datasets/chars";
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  let chars_req = await axios.get("https://puddle.farm/api/characters");
  let chars = chars_req.data;
  fs.writeFile(
    "./datasets/chars/chars.json",
    JSON.stringify(chars, null, "\t"),
    "utf8",
    (err) => {
      if (err) {
        console.error("Error writing file:", err);
        return;
      }
      console.log("File written successfully!");
    },
  );
  return chars;
}

fetch_characters();
