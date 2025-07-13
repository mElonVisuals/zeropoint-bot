// events/roleDelete.js
// Logs when a role is deleted from the guild.

const { EmbedBuilder } = require('discord.js');
const { LOG_CHANNEL_ID, ACCENT_COLOR } = require('../config.js');

module.exports = {
    name: 'roleDelete',
    async execute(role) {
        if (!LOG_CHANNEL_ID || LOG_CHANNEL_ID === 'YOUR_LOG_CHANNEL_ID') {
            console.warn("LOG_CHANNEL_ID is not configured in config.js. Role deletion will not be logged.");
            return;
        }

        const logChannel = role.guild.channels.cache.get(LOG_CHANNEL_ID);
        if (logChannel) {
            const embed = new EmbedBuilder()
                .setTitle('➖ Role Deleted')
                .setColor(ACCENT_COLOR)
                .addFields(
                    { name: 'Name', value: role.name || 'Unknown', inline: true }, // Role might be partial
                    { name: 'ID', value: role.id, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'ZeroPoint | Moderation Log' });

            await logChannel.send({ embeds: [embed] });
        }
    },
};
