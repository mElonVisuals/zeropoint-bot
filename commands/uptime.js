// commands/uptime.js
// Shows how long the bot has been online.

const { EmbedBuilder } = require('discord.js');
const { ACCENT_COLOR } = require('../config.js');

module.exports = {
    name: 'uptime',
    description: 'Shows how long the bot has been online.',
    async execute(message, args) {
        let totalSeconds = (message.client.uptime / 1000);
        let days = Math.floor(totalSeconds / 86400);
        totalSeconds %= 86400;
        let hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = Math.floor(totalSeconds % 60);

        const uptimeEmbed = new EmbedBuilder()
            .setTitle('Bot Uptime')
            .setDescription(`I have been online for: \`${days} days, ${hours} hours, ${minutes} minutes, and ${seconds} seconds.\``)
            .setColor(ACCENT_COLOR)
            .setFooter({ text: 'ZeroPoint | System Status' });

        await message.channel.send({ embeds: [uptimeEmbed] });
    },
};
