# JoyBot

### Because FmBot and DioBot weren't enough.

JoyBot is a mafia game management service, intended to be used on the BlankMediaGames forums. It can be used to help automate votecounts and store game data, with a bit of help from the hosts.

JoyBot is essentially a CouchBase DB combined with a series of cron jobs. It:

1. Scrapes the games topic for active games (i.e. stickied, unlocked games)
2. Scrapes each active game for votecounts
3. Maintains "last read" posts and legacy votecounts in a CouchBase DB
4. Resets vote counts if commanded by a host

## Completed features

[x] Basic cron job management
[x] Command parsing
[x] Automatic playerlist generation
[x] Monitoring active games
[ ] Parsing posts from active games
[ ] PM Support
[ ] Bot posting
[ ] Database

## Use

### Players

- `/vote <playername>` votes a player. `/vote` with no playername will randomly vote one of the hosts. Oops.
- `/unvote` will remove all of your votes. `/unvote {playername}` will remove your vote on a player, if you have one.

If you are only able to vote one player, joybot will automatically change your vote upon a `/vote` command. If you may vote multiple players, JoyBot will only register a vote if you have a vote that you have not placed on a player.

JoyBot will always support you voting the hosts. Including JoyBot. :)

JoyBot will try to parse nicknames/shortened versions of player names, but if there are multiple players with similar names or mispellings, JoyBot might not correctly count your vote.

### Hosts

To start JoyBot, include the line
`!joybot {options}` in the OP of your post. JoyBot parses all options sequentially.

- `--every {number}`: Creates a votecount every x minutes. One hour by default.
- `--autolock {true | false}`: Autolocks the thread if majority is reached. False by default. If true, will PM all hosts that the game has reached majority. Autolocking will not trigger if JoyBot has reached majority.
- `--majority {number}`: Overrides the number of votes needed to reach majority.
- `--reset`: Resets the votecount.
- `--add-host {name} {color}`: Adds a host to the host list. Host color is optional, but must be in the form of `#xxx` or `#xxxxxx` to register. joybot will always be considered a host.
- `--remove-hosts {name} {name}`: Removes host(s) from the hosts list.
- `--create-playerlist`: Tries to parse the post with the config for a "Playerlist" as shown in the OP of [VFM68](https://www.blankmediagames.com/phpbb/viewtopic.php?f=17&t=108218#p3434679). Expects that playernames are one word. If successfully called twice, it will wipe the old playerlist.
- `--add-players {player 1} {player 2}`: Adds a player(s) to the live playerlist.
- `--kill-players {player 1} {player 2}`: Removes a player(s) from the live playerlist and sets their vote weight to 0. Note that you can give dead players votes!
- `--replace-player {player 1} {player 2}`: Replaces player 1 with player 2.
- `--change-weight {player name} {weight} {split?}`: Updates the weight of a player's vote. Default vote weight is one. If `split` is true, then this allows the player to vote multiple players if their vote weight is greater than `1`.
- `--change-votes-needed {player name} {+/-}{weight}`: Updates the number of votes needed to lynch a player by `+/-` from maj, i.e. if maj is `4` and a host has run `!joybot +2`, the player will need to have `6` votes to be lynched. If maj changes to `3`, then the player will need `5` votes to be lynched.

After the initial command, JoyBot will only listen to in-thread commands from the person who created the configuration and any listed hosts. A host can add another host at any time.

Adding and removing a player will reset majority to its default. Include a `--majority` tag after to force set majority afterwards if needbe.

For now, JoyBot does not parse EOD posts or automatically remove players at maj. Include a joybot command in these posts to update the live playerlist/reset the vote count.

#### ISOS

Joybot will include a spoiler with all the isos of the hosts and players in each post.

#### PM Commands

Some commands are best suited for PMs. However, please note that JoyBot will not register PMs from hosts until they are on the host list.

JoyBot expects PMS with:

1. A topic with the game's thread number, which can be found by looking at the `t=000000` part of the game's url.
2. A body with a valid JoyBot command.

## Setup

1. Fill out the `.env` file.
2. `docker-compose up`.
