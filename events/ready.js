// events/ready.js
// This event fires when the bot successfully connects to Discord.

const { ActivityType } = require('discord.js');

module.exports = {
    name: 'ready',
    once: true, // This event should only run once
    async execute(client) {
        console.log(`Logged in as ${client.user.tag}!`);
        console.log('Bot is ready!');

        // --- Set Rich Presence ---
        // You can choose different activity types: PLAYING, STREAMING, LISTENING, WATCHING, CUSTOM, COMPETING
        client.user.setActivity('Cinematic Visions', { type: ActivityType.Watching });
        // Example for PLAYING: client.user.setActivity('with Cinematics!', { type: ActivityType.Playing });
        // Example for STREAMING (requires a valid Twitch/YouTube URL):
        // client.user.setActivity('ZeroPoint Live', { type: ActivityType.Streaming, url: 'YOUR_TWITCH_OR_YOUTUBE_STREAM_URL' });

        console.log('Bot presence set.');
    },
};
