const axios = require("axios");
const players = require("./datasets/aelings.json");
const fetch = require(path.join(process.cwd(), "/fetch_player.js"));

async function player_leaderboard(json) {
  let player_arr = [];
  for (let i in json) {
    await axios
      .get("https://puddle.farm/api/player/" + json[i].id)
      .then((response) => {
        function get_char_index() {
          for (let j in response.data.ratings) {
            if (response.data.ratings[j].char_short == json[i].main) return j;
          }
        }
        let char_index = get_char_index();
        player_arr.push({
          name: json[i].name,
          char: response.data.ratings[char_index].character,
          rating: response.data.ratings[char_index].rating,
        });
      });
  }
  player_arr.sort((a, b) => b.rating - a.rating);
  for (let i in player_arr) {
    let ranking = "";
    if (
      player_arr[i].rating.toString().startsWith("1000") &&
      player_arr[i].rating.toString().length > 5
    ) {
      ranking = player_arr[i].rating.toString().slice(4) + " DR";
    } else {
      ranking = player_arr[i].rating + " RP";
    }
    console.log(
      player_arr[i].name + " (" + player_arr[i].char + ", " + ranking + ")",
    );
  }
}

list = player_leaderboard(players);
