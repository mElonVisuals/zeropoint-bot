// index.js
// This is the main entry point for your ZeroPoint Discord bot.

require('dotenv').config(); // Load environment variables from .env file (for local development)
const fs = require('node:fs'); // Node.js file system module for reading directories
const path = require('node:path'); // Node.js path module for resolving file paths

const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const { PREFIX, ZEROPOINT_LOGO_URL } = require('./config.js'); // Import configuration constants

// --- Bot Initialization ---

// Define the intents your bot will use.
// Intents specify which events your bot wants to receive from Discord.
// You MUST enable 'MESSAGE CONTENT INTENT', 'PRESENCE INTENT', and 'SERVER MEMBERS INTENT'
// in the Discord Developer Portal for your bot to function correctly.
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,           // Required for guild-related events (e.g., guildMemberAdd)
        GatewayIntentBits.GuildMessages,    // Required to receive messages
        GatewayIntentBits.MessageContent,   // CRUCIAL: Required to read the content of messages for commands
        GatewayIntentBits.GuildMembers,     // CRUCIAL: Required for guildMemberAdd event
        GatewayIntentBits.GuildPresences    // Required for setting/updating bot presence
    ],
    partials: [Partials.Channel, Partials.Message, Partials.GuildMember, Partials.User]
});

// Create a Collection to store your commands
client.commands = new Collection();

// --- Command Handler ---
// Dynamically load command files from the 'commands' directory
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ('name' in command && 'execute' in command) {
        client.commands.set(command.name, command);
        console.log(`Loaded command: ${command.name}`);
    } else {
        console.warn(`[WARNING] The command at ${filePath} is missing a required "name" or "execute" property.`);
    }
}

// --- Event Handler ---
// Dynamically load event files from the 'events' directory
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(client, ...args));
        console.log(`Loaded one-time event: ${event.name}`);
    } else {
        client.on(event.name, (...args) => event.execute(client, ...args));
        console.log(`Loaded event: ${event.name}`);
    }
}

// --- Message Listener (for prefix commands) ---
client.on('messageCreate', async message => {
    // Ignore messages from bots and messages that don't start with the defined prefix
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Get the command from the client.commands Collection
    const command = client.commands.get(commandName);

    // If the command doesn't exist, return
    if (!command) return;

    try {
        await command.execute(message, args);
    } catch (error) {
        console.error(`Error executing command ${commandName}:`, error);
        await message.reply({ content: 'There was an error trying to execute that command!', ephemeral: true });
    }
});

// --- Bot Login ---
const TOKEN = process.env.DISCORD_BOT_TOKEN;

if (!TOKEN) {
    console.error("Error: DISCORD_BOT_TOKEN environment variable not set.");
    console.error("Please set the DISCORD_BOT_TOKEN environment variable with your bot's token.");
} else {
    client.login(TOKEN).catch(error => {
        if (error.code === 'TOKEN_INVALID') {
            console.error("Error: Invalid bot token. Please check your DISCORD_BOT_TOKEN environment variable.");
        } else {
            console.error(`An unexpected error occurred during login: ${error.message}`);
        }
    });
}
