// events/messageUpdate.js
// Logs when a message is edited.

const { EmbedBuilder, InteractionResponseFlags } = require('discord.js'); // Added InteractionResponseFlags
const { LOG_CHANNEL_ID, ACCENT_COLOR } = require('../config.js');

module.exports = {
    name: 'messageUpdate',
    async execute(oldMessage, newMessage) {
        try {
            // If oldMessage is partial, try to fetch it.
            if (oldMessage.partial) {
                try {
                    oldMessage = await oldMessage.fetch();
                } catch (error) {
                    console.warn(`[WARN] Could not fetch old partial message (ID: ${oldMessage.id || 'unknown'}). It might have been deleted too quickly or is unavailable. Skipping log.`);
                    return; // Exit if old message cannot be fetched
                }
            }

            // Ensure author is available after fetching
            if (!oldMessage.author) {
                console.warn(`[WARN] Old message (ID: ${oldMessage.id || 'unknown'}) has no author information available. Skipping log.`);
                return; // Exit if author is missing
            }

            // Ignore messages from bots
            if (oldMessage.author.bot) return;
            // Ignore DMs
            if (!oldMessage.guild) return;
            // Ignore if content is the same (e.g., only embed changes or reactions)
            if (oldMessage.content === newMessage.content) return;

            if (!LOG_CHANNEL_ID || LOG_CHANNEL_ID === 'YOUR_LOG_CHANNEL_ID') {
                console.warn("LOG_CHANNEL_ID is not configured in config.js. Message edits will not be logged.");
                return;
            }

            const logChannel = newMessage.guild.channels.cache.get(LOG_CHANNEL_ID);
            if (logChannel) {
                const embed = new EmbedBuilder()
                    .setTitle('✏️ Message Edited')
                    .setColor(ACCENT_COLOR)
                    .addFields(
                        { name: 'Author', value: `${newMessage.author.tag} (${newMessage.author.id})`, inline: true },
                        { name: 'Channel', value: `${newMessage.channel.name} (<#${newMessage.channel.id}>)`, inline: true },
                        { name: 'Old Content', value: oldMessage.content ? `\`\`\`${oldMessage.content}\`\`\`` : '*(No content)*', inline: false },
                        { name: 'New Content', value: newMessage.content ? `\`\`\`${newMessage.content}\`\`\`` : '*(No content)*', inline: false },
                        { name: 'Message Link', value: `[Jump to Message](${newMessage.url})`, inline: false }
                    )
                    .setTimestamp()
                    .setFooter({ text: 'ZeroPoint | Moderation Log' });

                await logChannel.send({ embeds: [embed] });
            }
        } catch (error) {
            console.error(`An error occurred in messageUpdate for message ID ${oldMessage.id || 'undefined'}:`, error);
        }
    },
};
