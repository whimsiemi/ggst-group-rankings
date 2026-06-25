const axios = require("axios");
const fs = require("fs");
const path = require("path");
let player_list = [];
const file_name = "temp";
try {
  player_list = require(
    path.join(process.cwd(), "/datasets/" + file_name + ".json"),
  );
} catch (_err) {
  console.log("Can't find json! Making new json...");
  player_list = [];
}

async function fetch_player(display_name, id, char, array) {
  await axios.get("https://puddle.farm/api/player/" + id).then((response) => {
    let char_index = 0;
    for (let i in response.data.ratings) {
      if (response.data.ratings[i].char_short == char) {
        char_index = i;
        break;
      }
    }
    let arr = {
      name: display_name != null ? display_name : response.data.name,
      id: id,
      main: response.data.ratings[char_index].char_short,
      char: {
        full: response.data.ratings[char_index].character,
        short: response.data.ratings[char_index].char_short,
        rating: response.data.ratings[char_index].rating,
      },
    };
    let found = false;
    for (let i in array) {
      if (array[i].name == arr.name && array[i].main == arr.main) {
        array[i] = arr;
        found = true;
        break;
      }
    }
    if (!found) {
      array.push(arr);
    }
    fs.writeFile(
      "./datasets/" + file_name + ".json",
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
    return arr;
  });
}
fetch_player("Pollka", "250411180922771976", "MA", player_list);

module.exports = fetch_player;
