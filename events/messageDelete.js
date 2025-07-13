// events/messageDelete.js
// This event fires when a message is deleted. Useful for moderation logs.

const { EmbedBuilder } = require('discord.js');
const { LOG_CHANNEL_ID, ACCENT_COLOR } = require('../config.js');

module.exports = {
    name: 'messageDelete',
    async execute(message) {
        // Ignore messages from bots to prevent logging bot's own deleted messages
        if (message.author.bot) return;

        // Ensure the log channel ID is configured
        if (!LOG_CHANNEL_ID || LOG_CHANNEL_ID === 'YOUR_LOG_CHANNEL_ID') {
            console.warn("LOG_CHANNEL_ID is not configured in config.js. Deleted messages will not be logged.");
            return;
        }

        const logChannel = message.guild.channels.cache.get(LOG_CHANNEL_ID);
        if (logChannel) {
            const embed = new EmbedBuilder()
                .setTitle('🗑️ Message Deleted')
                .setColor(ACCENT_COLOR)
                .addFields(
                    { name: 'Author', value: `${message.author.tag} (${message.author.id})`, inline: true },
                    { name: 'Channel', value: `${message.channel.name} (<#${message.channel.id}>)`, inline: true },
                    { name: 'Message Content', value: message.content ? `\`\`\`${message.content}\`\`\`` : '*(No content or embed)*', inline: false }
                )
                .setTimestamp()
                .setFooter({ text: 'ZeroPoint | Moderation Log' });

            await logChannel.send({ embeds: [embed] });
        } else {
            console.log(`Warning: Log channel with ID ${LOG_CHANNEL_ID} not found.`);
        }
    },
};
