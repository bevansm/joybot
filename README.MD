# JoyBot

### Because FmBot and DioBot weren't enough.

JoyBot is a mafia game management service, intended to be used on the BlankMediaGames forums. It can be used to help automate votecounts and store game data, with a bit of help from the hosts.

JoyBot is essentially a NoSQL DB combined with a series of cron jobs. It:

1. Scrapes the games topic for active games (i.e. stickied, unlocked games)
2. Scrapes each active game for votecounts
3. Maintains "last read" posts and legacy votecounts in a NoSQL DB
4. Resets vote counts if commanded by a host

## Worklist

# Post Parsing

- [x] Host command parsing
- [x] Player command parsing
- [x] Automatic playerlist generation
- [x] Checking if host actions cause player death
- [x] Parsing posts from active games
- [x] Vote inference
- [x] Host color inference

# Infastructure

- [x] Basic cron job management
- [x] Monitoring active games
- [x] Automatic job generation
- [ ] Database
- [x] Post Support
- [ ] PM Support
- [ ] API Implementation
- [x] Middleware for axios for saving cookies

# Automation

- [x] Automated deploy with docker
- [x] Fix ERRCONNECT issue w/docker
- [ ] Automated deploy on AWS EC2/GCP
- [x] Node logging library

## Use

### Players

JoyBot looks for bolded `/***` commands from players. Currently, only votes are supported.

- `/vote <playername>` votes a player. `/vote` with no playername will randomly vote one of the hosts. Oops.
- `/unvote` will remove all of your votes. `/unvote {playername}` will remove your vote on a player, if you have one.

If you are only able to vote one player, joybot will automatically change your vote upon a `/vote` command. If you may vote multiple players, JoyBot will only register a vote if you have a vote that you have not placed on a player.

JoyBot will try to parse nicknames/shortened versions of player names, but if there are multiple players with similar names or mispellings, JoyBot might not correctly count your vote.

### Hosts

To start JoyBot, include the line
`!joybot {options}` in the OP of your post. JoyBot parses all options sequentially.

- `--print {boolean}`: If true, JoyBot will dump the entire contents of the game into its next post.
  - JoyBot will use the last call of this command when posting.
  - The printed game is not censored. Calling this in thread may leak game information.
- `--every {number}`: Creates a votecount every x minutes. One hour by default.
- `--autolock {true | false}`: Autolocks the thread if majority is reached. False by default. If true, will PM all hosts that the game has reached majority. Autolocking will not trigger if JoyBot has reached majority.
- `--majority {number}`: Overrides the number of votes needed to reach majority.
- `--reset`: Resets the votecount.
- `--add-host {name} {color}`: Adds a host to the host list. Host color is optional, but must be in the form of `#xxx` or `#xxxxxx` to register. joybot will always be considered a host.
- `--remove-hosts {name} {name}`: Removes host(s) from the hosts list.
- `--set-host-color {name} {color}`: Sets the mod color of the give host.
- `--create-playerlist`: Tries to parse the post with the config for a "Playerlist" as shown in the OP of [VFM68](https://www.blankmediagames.com/phpbb/viewtopic.php?f=17&t=108218#p3434679).
  - The list header (i.e. "Playerlist", "Players") must be bolded/underlined
  - The playerlist must be a bbcode `[list]` or `[list=]` element
  - Expects that playernames are one word and that the playerlist is inside an ordered list, i.e. numbered.
  - If successfully called twice, it will wipe the old playerlist and replace it with a new one.
- `--add-players {player 1} {player 2}`: Adds a player(s) to the live playerlist.
- `--kill-players {player 1} {player 2}`: Removes a player(s) from the live playerlist and sets their vote weight to 0. Note that you can give dead players votes!
- `--replace-player {player 1} {player 2}`: Replaces player 1 with player 2.
- `--change-weight {player name} {weight} {split?}`: Updates the weight of a player's vote. Default vote weight is one. If `split` is true, then this allows the player to vote multiple players if their vote weight is greater than `1`. Each of their votes will have a weight of `1`.
  - Toggling on or off split will cause the player to remote all of their votes.
- `--change-votes-needed {player name} {+/-}{weight}`: Updates the number of votes needed to lynch a player by `+/-` from maj.
  -e.g. Maj is `4` and a host has run `!joybot james +2`. James will need to have `6` votes to be lynched. If maj changes to `3`, James will need `5` votes to be lynched.

After the initial command, JoyBot will only listen to in-thread commands from the person who created the configuration and any listed hosts. A host can add another host at any time.

JoyBot tries to store host color codes. If a host does not have a color code, JoyBot will try to infer it from any post they make with the `!joybot` command. Internally, JoyBot represents 'no color code' with `#000`. It's reccomended to explicitly set the host's hext color to `#000000` if the host really does use black as a host color.

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
2. `docker-compose run joybot`.
3. Provide a captcha.

### Captcha

During setup, you will be prompted for a captcha token. To obtain:

1. Navigate to the signin page
2. Complete the captcha. Do not log in.
3. Press f12 to open devtools and open the console tab.
4. Type 'grecaptcha.getResponse()'
5. Paste the result into your terminal

# TIL

Lots of spaghetti code with this one--everything from mutating state to swapping between regex and javascript string parsing to weird naming conventions. Mostly wrote this 'for fun' to kill some time during quarentine, work with Jest, and reminsce about BLFM.
