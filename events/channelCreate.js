// events/channelCreate.js
// Logs when a new channel is created in the guild.

const { EmbedBuilder } = require('discord.js');
const { LOG_CHANNEL_ID, ACCENT_COLOR } = require('../config.js');

module.exports = {
    name: 'channelCreate',
    async execute(channel) {
        // Ignore DM channels
        if (!channel.guild) return;

        if (!LOG_CHANNEL_ID || LOG_CHANNEL_ID === 'YOUR_LOG_CHANNEL_ID') {
            console.warn("LOG_CHANNEL_ID is not configured in config.js. Channel creation will not be logged.");
            return;
        }

        const logChannel = channel.guild.channels.cache.get(LOG_CHANNEL_ID);
        if (logChannel) {
            const embed = new EmbedBuilder()
                .setTitle('➕ Channel Created')
                .setColor(ACCENT_COLOR)
                .addFields(
                    { name: 'Name', value: channel.name, inline: true },
                    { name: 'ID', value: channel.id, inline: true },
                    { name: 'Type', value: channel.type ? channel.type.toString() : 'Unknown', inline: true }, // Use toString() for better type representation
                    { name: 'Category', value: channel.parent ? channel.parent.name : 'None', inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'ZeroPoint | Moderation Log' });

            await logChannel.send({ embeds: [embed] });
        }
    },
};
