const axios = require("axios");
const fs = require("fs");
const path = require("path");
let player_list = [];

function fetch_player(display_name, id, char, server_id, entry) {
  let array = [];
  try {
    array = require(
      path.join(process.cwd(), "/datasets/" + server_id + ".json"),
    );
  } catch (_err) {
    console.log("Can't find json! Making new json...");
    array = [];
  }
  axios.get("https://puddle.farm/api/player/" + id).then((response) => {
    let char_index = 0;
    for (let i in response.data.ratings) {
      if ((response.data.ratings[i].char_short == char) || (response.data.ratings[i].char_short == entry && char == "")) {
        char_index = i;
        break;
      }
    }
    let arr = {
      name: (display_name != null && display_name != "") ? display_name : response.data.name,
      id: id,
      main: response.data.ratings[char_index].char_short,
      char: {
        full: response.data.ratings[char_index].character,
        short: response.data.ratings[char_index].char_short,
        rating: response.data.ratings[char_index].rating,
      },
    };
    let found = false;
    if (entry != null) {
      for (let i in array) {
        if (array[i].id == arr.id && array[i].main == entry) {
          if (display_name == null || display_name == "") {
            arr.name = array[i].name;
          }
          if (char == null) {
            arr.main = array[i].main;
            arr.char = array[i].char;
          }
          array[i] = arr;
          found = true;
          break;
        }
      }
    } else {
      for (let i in array) {
        if (array[i].id == arr.id) {
          if (display_name == null || display_name == "") {
            arr.name = array[i].name;
          }
          if (array[i].main == arr.main) {
            found = true;
            if (char == null) {
              arr.main = array[i].main;
              arr.char = array[i].char;
            }
            array[i] = arr;
          }
          break;
        }
      }
      if (!found) {
        array.push(arr);
      }
    }
    fs.writeFile(
      "./datasets/" + server_id + ".json",
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

module.exports = fetch_player;
