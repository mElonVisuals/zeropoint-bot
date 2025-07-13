// events/channelDelete.js
// Logs when a channel is deleted from the guild.

const { EmbedBuilder } = require('discord.js');
const { LOG_CHANNEL_ID, ACCENT_COLOR } = require('../config.js');

module.exports = {
    name: 'channelDelete',
    async execute(channel) {
        // Ignore DM channels
        if (!channel.guild) return;

        if (!LOG_CHANNEL_ID || LOG_CHANNEL_ID === 'YOUR_LOG_CHANNEL_ID') {
            console.warn("LOG_CHANNEL_ID is not configured in config.js. Channel deletion will not be logged.");
            return;
        }

        const logChannel = channel.guild.channels.cache.get(LOG_CHANNEL_ID);
        if (logChannel) {
            const embed = new EmbedBuilder()
                .setTitle('➖ Channel Deleted')
                .setColor(ACCENT_COLOR)
                .addFields(
                    { name: 'Name', value: channel.name || 'Unknown', inline: true }, // Channel might be partial
                    { name: 'ID', value: channel.id, inline: true },
                    { name: 'Type', value: channel.type ? channel.type.toString() : 'Unknown', inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'ZeroPoint | Moderation Log' });

            await logChannel.send({ embeds: [embed] });
        }
    },
};
