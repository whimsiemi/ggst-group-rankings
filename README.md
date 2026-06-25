# GGST - Silli Leaderboard
Using this Discord bot, make a leaderboard featuring a group of players, from friends and local scene members to national pros and even just your collection of alts!

## Hosting a fork of this bot
1. Create a `config.json` file in the root directory
2. In it, include your bot token as well as your client ID like this:
```
{
    "token": "your-token-here",
    "clientId": "your-clientid-here",
}
```
3. Run `fetch_data.js` in a Node terminal to fetch the puddle-farm character data required to make the bot work
4. Run `index.js` to start the bot