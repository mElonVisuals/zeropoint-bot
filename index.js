// index.js
require('dotenv').config(); // For loading environment variables from a .env file locally

const { Client, GatewayIntentBits, Partials, EmbedBuilder } = require('discord.js');

// --- Configuration ---
// Get your bot token from environment variables (important for security)
// You will set this in Coolify later.
const TOKEN = process.env.DISCORD_BOT_TOKEN;

// Define the intents your bot will use.
// Intents specify which events your bot wants to receive from Discord.
// You MUST enable 'MESSAGE CONTENT INTENT' and 'PRESENCE INTENT' in the Discord Developer Portal
// for your bot to read message content and respond to commands, and detect member presence.
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent, // Required to read message content for commands
        GatewayIntentBits.GuildMembers,   // Required for on_member_join event
        GatewayIntentBits.GuildPresences  // Optional: If you want to access presence information
    ],
    partials: [Partials.Channel, Partials.Message, Partials.GuildMember, Partials.User] // Required for some events like member join
});

// Define the command prefix
const PREFIX = '!';

// --- Bot Events ---

client.once('ready', () => {
    /**
     * This event fires when the bot successfully connects to Discord.
     */
    console.log(`Logged in as ${client.user.tag}!`);
    console.log('Bot is ready!');
    // Set the bot's status
    client.user.setActivity('with Cinematics!', { type: 'PLAYING' });
});

client.on('guildMemberAdd', async member => {
    /**
     * This event fires when a new member joins the server.
     * Remember to enable 'SERVER MEMBERS INTENT' in the Developer Portal if you use this.
     */
    // Replace 'YOUR_WELCOME_CHANNEL_ID' with the actual ID of your welcome channel.
    // To get a channel ID: Enable Developer Mode in Discord settings (Appearance -> Advanced -> Developer Mode),
    // then right-click on the channel and select "Copy ID".
    const welcomeChannelId = '1365071343414018078'; // Example: '123456789012345678'

    const channel = member.guild.channels.cache.get(welcomeChannelId);
    if (channel) {
        const embed = new EmbedBuilder()
            .setTitle(`👋 Welcome to ZeroPoint, ${member.user.username}!`)
            .setDescription(`We're thrilled to have you join our community, the premier destination for captivating YouTube cinematics and bespoke commissions for the FiveM community. Get ready to explore the art of visual storytelling!`)
            .setColor(0x2cb4e9) // Your desired hex color (2cb4e9)
            .addFields(
                {
                    name: '🚀 Get Started:',
                    value: `Head over to <#YOUR_RULES_CHANNEL_ID> to review our guidelines.\nIntroduce yourself in <#YOUR_INTRODUCTIONS_CHANNEL_ID>!`,
                    inline: false
                },
                {
                    name: '🎬 Explore Our Work:',
                    value: `Check out our latest cinematics on our YouTube channel: [ZeroPoint YouTube](YOUR_YOUTUBE_CHANNEL_URL_HERE)`,
                    inline: false
                }
            )
            .setThumbnail('https://melonvisuals.me/test/zeropoint.png')
            .setFooter({ text: 'ZeroPoint | Your Cinematic Journey Begins' });

        await channel.send({ content: `Welcome ${member.toString()}!`, embeds: [embed] });
    } else {
        console.log(`Warning: Welcome channel with ID ${welcomeChannelId} not found.`);
    }
});

client.on('messageCreate', async message => {
    /**
     * This event fires when a new message is created.
     * We use this to process commands.
     */
    // Ignore messages from bots and messages that don't start with the prefix
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // --- Bot Commands ---
    if (command === 'ping') {
        /**
         * Responds with 'Pong!' and the bot's latency.
         * Usage: !ping
         */
        await message.channel.send(`Pong! Latency: ${Math.round(client.ws.ping)}ms`);
    } else if (command === 'hello') {
        /**
         * Greets the user.
         * Usage: !hello
         */
        await message.channel.send(`Hello, ${message.author.display_name}! Welcome to ZeroPoint.`);
    } else if (command === 'zeropoint') {
        /**
         * Provides a brief overview of ZeroPoint.
         * Usage: !zeropoint
         */
        const embed = new EmbedBuilder()
            .setTitle('✨ Welcome to ZeroPoint! ✨')
            .setDescription('Your premier destination for captivating YouTube cinematics, specializing in both passion projects and bespoke commissions for the FiveM community.')
            .setColor(0x2cb4e9)
            .addFields(
                { name: 'Our Mission', value: 'We transform concepts into stunning visual narratives, delivering high-quality, immersive experiences that bring your stories to life.', inline: false },
                { name: 'Learn More', value: 'Check out our work and commission info in <#1393741240922542192> or on our [Website](https://melonvisuals.me/zeropoint).', inline: false }
            )
            .setThumbnail('https://melonvisuals.me/test/zeropoint.png')
            .setFooter({ text: 'ZeroPoint | Elevate Your Visuals' });

        await message.channel.send({ embeds: [embed] });
    }
});

// --- Run the Bot ---
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

// --- Placeholders to Replace ---
// You can get channel IDs by enabling Developer Mode in Discord (User Settings -> Advanced)
// then right-clicking on a channel and selecting "Copy ID".
// Replace these with your actual channel IDs and URLs!
// Example: const YOUR_WELCOME_CHANNEL_ID = '123456789012345678';
const YOUR_WELCOME_CHANNEL_ID = '1365071343414018078'; // Replace with your actual Welcome channel ID
const YOUR_RULES_CHANNEL_ID = '1364678092362223716'; // Replace with your actual Rules channel ID
const YOUR_INTRODUCTIONS_CHANNEL_ID = '1393953737197879396'; // Replace with your actual Introductions channel ID
const YOUR_COMMISSION_INFO_CHANNEL_ID = '1393741240922542192'; // Replace with your actual Commission Info channel ID
const YOUR_YOUTUBE_CHANNEL_URL_HERE = "https://www.youtube.com/@melon.visuals"; // Replace with your YouTube URL
const YOUR_WEBSITE_URL_HERE = "https://melonvisuals.me"; // Replace with your website URL
