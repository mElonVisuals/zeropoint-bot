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
                    await message.fetch();
                } catch (error) {
                    console.warn(`[WARN] Could not fetch partial message (ID: ${message.id}). It might have been deleted too quickly or is unavailable.`);
                    // If fetching fails, we can't log details, so we exit.
                    return;
                }
            }

            // Ignore messages from bots to prevent logging bot's own deleted messages
            if (message.author.bot) return;
            // Ignore DMs
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
            console.error(`An error occurred in messageDelete for message ID ${message.id}:`, error);
            // This catch block handles any errors during the event execution.
        }
    },
};
