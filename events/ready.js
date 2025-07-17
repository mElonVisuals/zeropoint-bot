// events/ready.js
// This event fires when the bot successfully connects to Discord.

const { ActivityType } = require('discord.js');
const { ZEROPOINT_LOGO_URL } = require('../config.js'); // Assuming you might use this for presence later

module.exports = {
    name: 'ready',
    once: true, // This event should only run once
    async execute(client) {
        console.log(`Logged in as ${client.user.tag}!`);
        console.log('Bot is ready!');

        // --- Dynamic Rich Presence ---
        const activities = [
            { name: 'Cinematic Visions', type: ActivityType.Watching },
            { name: 'New Stories', type: ActivityType.Playing },
            { name: 'Your Ideas', type: ActivityType.Listening },
            { name: 'melonvisuals.me', type: ActivityType.Watching } // Link to your website
        ];

        let i = 0;
        setInterval(() => {
            const activity = activities[i];
            client.user.setActivity(activity.name, { type: activity.type });
            i = (i + 1) % activities.length; // Cycle through activities
        }, 15000); // Change activity every 15 seconds

        console.log('Bot presence set up for cycling.');
    },
};
