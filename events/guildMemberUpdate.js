// events/guildMemberUpdate.js
// Logs when a member's details (nickname, roles) are updated.

const { EmbedBuilder } = require('discord.js');
const { LOG_CHANNEL_ID, ACCENT_COLOR } = require('../config.js');

module.exports = {
    name: 'guildMemberUpdate',
    async execute(oldMember, newMember) {
        // Ignore if only presence/activity changed (handled by Presence Intent)
        // This event fires for many changes, we only want specific ones for logging.
        if (oldMember.nickname === newMember.nickname &&
            oldMember.roles.cache.size === newMember.roles.cache.size) {
            // Add more specific checks if needed, e.g., for user status changes
            return;
        }

        // Ensure the log channel ID is configured
        if (!LOG_CHANNEL_ID || LOG_CHANNEL_ID === 'YOUR_LOG_CHANNEL_ID') {
            console.warn("LOG_CHANNEL_ID is not configured in config.js. Member updates will not be logged.");
            return;
        }

        const logChannel = newMember.guild.channels.cache.get(LOG_CHANNEL_ID);
        if (logChannel) {
            const embed = new EmbedBuilder()
                .setTitle('📝 Member Updated')
                .setColor(ACCENT_COLOR)
                .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: 'User', value: `${newMember.user.tag} (${newMember.user.id})`, inline: false }
                )
                .setTimestamp()
                .setFooter({ text: 'ZeroPoint | Moderation Log' });

            // Check for nickname change
            if (oldMember.nickname !== newMember.nickname) {
                embed.addFields({ name: 'Nickname Changed', value: `Old: \`${oldMember.nickname || 'None'}\`\nNew: \`${newMember.nickname || 'None'}\``, inline: false });
            }

            // Check for role changes
            const oldRoles = oldMember.roles.cache.map(role => role.id);
            const newRoles = newMember.roles.cache.map(role => role.id);

            const addedRoles = newRoles.filter(roleId => !oldRoles.includes(roleId));
            const removedRoles = oldRoles.filter(roleId => !newRoles.includes(roleId));

            if (addedRoles.length > 0) {
                const roleNames = addedRoles.map(id => newMember.guild.roles.cache.get(id).name).join(', ');
                embed.addFields({ name: '➕ Roles Added', value: roleNames, inline: false });
            }
            if (removedRoles.length > 0) {
                const roleNames = removedRoles.map(id => oldMember.guild.roles.cache.get(id).name).join(', ');
                embed.addFields({ name: '➖ Roles Removed', value: roleNames, inline: false });
            }

            if (addedRoles.length > 0 || removedRoles.length > 0 || oldMember.nickname !== newMember.nickname) {
                await logChannel.send({ embeds: [embed] });
            }
        } else {
            console.log(`Warning: Log channel with ID ${LOG_CHANNEL_ID} not found for guildMemberUpdate.`);
        }
    },
};
