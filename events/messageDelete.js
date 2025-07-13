// events/messageDelete.js
// This event fires when a message is deleted. Useful for moderation logs.

const { EmbedBuilder } = require('discord.js');
const { LOG_CHANNEL_ID, ACCENT_COLOR } = require('../config.js');

module.exports = {
    name: 'messageDelete',
    async execute(message) {
        try {
            // If the message is a partial, attempt to fetch its full data.
            // This is crucial because partial messages might not have author or content.
            if (message.partial) {
                try {
                    // Fetch the message. If it fails, the message might be too old or unavailable.
                    message = await message.fetch();
                } catch (error) {
                    console.warn(`[WARN] Could not fetch partial message (ID: ${message.id || 'unknown'}). It might have been deleted too quickly or is unavailable. Skipping log.`);
                    // If fetching fails, we can't log details, so we exit.
                    return;
                }
            }

            // Ensure message.id is available for logging
            if (!message.id) {
                console.warn(`[WARN] Message (ID: undefined) has no ID available. Skipping log.`);
                return;
            }

            // Ensure author is available after fetching
            if (!message.author) {
                console.warn(`[WARN] Message (ID: ${message.id}) has no author information available. Skipping log.`);
                return;
            }

            // Ignore messages from bots to prevent logging bot's own deleted messages
            if (message.author.bot) return;
            // Ignore DMs - ensure message.guild exists
            if (!message.guild) return;

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
            }
        } catch (error) {
            console.error(`An error occurred in messageDelete for message ID ${message.id || 'undefined'}:`, error);
            // This catch block handles any errors during the event execution.
        }
    },
};
