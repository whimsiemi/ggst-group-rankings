const axios = require("axios");
let list_obj = [];

async function fetch_player(display_name, id, char) {
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
      char: {
        full: response.data.ratings[char_index].character,
        short: response.data.ratings[char_index].char_short,
        rating: response.data.ratings[char_index].rating,
        visible: false,
      },
    };
    return arr;
  });
}
fetch_player("Pollka", "250411180922771976", "MA");

module.exports = fetch_player;
