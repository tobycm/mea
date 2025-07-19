<img src="https://raw.githubusercontent.com/tobycm/mea/refs/heads/main/assets/mea%20bot%20banner.png" alt="Banner">

# mea bot

A Discord bot for downloading media files from various services using the [Cobalt API](https://github.com/imputnet/cobalt/tree/main/api).

Invite the bot here: [https://discord.com/oauth2/authorize?client_id=1389427401066545304](https://discord.com/oauth2/authorize?client_id=1389427401066545304)

## Table of Contents

- [Requirements](#requirements)
- [Getting started](#getting-started)
- [Features & Commands](#features--commands)
- [Contributing](#contributing)
- [License](#license)

## Requirements

- **Node.js v20** or higher
- **npm** or **bun** package manager
- A **Discord bot token** and necessary permissions set up in the [Discord Developer Portal](https://discord.com/developers/applications)
- A **Cobalt API URL**
- A **Cobalt API key**
- Docker if you want to run the Cobalt instance locally

## Getting started

### Installation & Setup

Setting up the cobalt instance:

```bash
docker compose up -d
```

Setting up the bot:

```bash
# Clone the repository
git clone https://github.com/tobycm/mea.git

# Enter into the directory
cd mea

# Install dependencies
# Using npm
bun install
# Or using npm
npm install

# Run the initialization script
bun run init
# or using npm
npm run init

# Edit the .env file with your configuration

$EDITOR .env

# Start the bot
bun run start
# or using npm
npm run start

# To run the bot in development mode
bun run dev
# or using npm
npm run dev
```

### Required permissions

Make sure your bot has the **`applications.commands`** scope enabled under the **OAuth2** settings in the [Discord Developer Portal](https://discord.com/developers/applications).

Also, enable the following **Privileged Gateway Intents** under the **Bot** tab:

- **Server Members Intent**
- **Message Content Intent**

These are required for the bot to receive relevant events and use slash commands properly.

### Deploying commands

Before using the bot, you need to deploy the commands to your Discord server. In Discord, you can use the following command to deploy them:

```sh
@mea deploy
```

## Features & Commands

### Download

⬇️ Download media files from a URL.

`/download <url>` +15 optional (e.g. `start_time`, `end_time`, etc.)

### Auto-download

⚙️ Set up auto-download for media files.

`/autodownload` +14 optional (e.g. `quality`, `audio_bitrate`, etc.)

### Remove auto-download

🗑️ Turn off auto-download for media files.

`/removeautodownload`

### Services

🌐 Get a list of supported services.

`/services`

## Contributing

You are welcome to contribute by submitting issues or pull requests!

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
