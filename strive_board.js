const path = require("path");
const axios = require("axios");

function strive_board_builder(guild)
{
    let array = [];
    array = require(
      path.join(process.cwd(), "/datasets/" + guild + ".json"),
    );
    let ranking_arr = [];
    let ranking_txt = "";
    for (let i in array) {
      axios
        .get("https://puddle.farm/api/player/" + array[i].id)
        .then((response) => {
          function get_char_index() {
            for (let j in response.data.ratings) {
              if (response.data.ratings[j].char_short == array[i].main) return j;
            }
          }
          let char_index = get_char_index();
          ranking_arr.push({
            name: array[i].name,
            char: response.data.ratings[char_index].character,
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
      ranking_txt =
        ranking_txt +
        ranking_arr[i].name +
        " (" +
        ranking_arr[i].char +
        ", " +
        ranking +
        ")\n";
    }
    return ranking_txt;
}

module.exports = strive_board_builder;