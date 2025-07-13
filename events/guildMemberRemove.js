// events/guildMemberRemove.js
// This event fires when a member leaves or is removed from the server.

const { EmbedBuilder } = require('discord.js');
const { FAREWELL_CHANNEL_ID, ACCENT_COLOR } = require('../config.js');

module.exports = {
    name: 'guildMemberRemove',
    async execute(member) {
        // Ensure the farewell channel ID is configured
        if (!FAREWELL_CHANNEL_ID || FAREWELL_CHANNEL_ID === 'YOUR_FAREWELL_CHANNEL_ID') {
            console.warn("FAREWELL_CHANNEL_ID is not configured in config.js. Farewell message will not be sent.");
            return;
        }

        const channel = member.guild.channels.cache.get(FAREWELL_CHANNEL_ID);
        if (channel) {
            const embed = new EmbedBuilder()
                .setTitle(`👋 Goodbye, ${member.user.username}!`)
                .setDescription(`We're sad to see **${member.user.username}** leave the ZeroPoint community. We hope to see you again soon!`)
                .setColor(ACCENT_COLOR)
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true })) // Show the user's avatar
                .setFooter({ text: 'ZeroPoint | Member Departed' })
                .setTimestamp(); // Add a timestamp

            await channel.send({ embeds: [embed] });
        } else {
            console.log(`Warning: Farewell channel with ID ${FAREWELL_CHANNEL_ID} not found.`);
        }
    },
};
