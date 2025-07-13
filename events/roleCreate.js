// events/roleCreate.js
// Logs when a new role is created in the guild.

const { EmbedBuilder } = require('discord.js');
const { LOG_CHANNEL_ID, ACCENT_COLOR } = require('../config.js');

module.exports = {
    name: 'roleCreate',
    async execute(role) {
        if (!LOG_CHANNEL_ID || LOG_CHANNEL_ID === 'YOUR_LOG_CHANNEL_ID') {
            console.warn("LOG_CHANNEL_ID is not configured in config.js. Role creation will not be logged.");
            return;
        }

        const logChannel = role.guild.channels.cache.get(LOG_CHANNEL_ID);
        if (logChannel) {
            const embed = new EmbedBuilder()
                .setTitle('➕ Role Created')
                .setColor(ACCENT_COLOR)
                .addFields(
                    { name: 'Name', value: role.name, inline: true },
                    { name: 'ID', value: role.id, inline: true },
                    { name: 'Color', value: role.hexColor, inline: true },
                    { name: 'Mentionable', value: role.mentionable ? 'Yes' : 'No', inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'ZeroPoint | Moderation Log' });

            await logChannel.send({ embeds: [embed] });
        }
    },
};
