// events/voiceStateUpdate.js
// Logs when a user joins, leaves, mutes, or unmutes in a voice channel.

const { EmbedBuilder } = require('discord.js');
const { LOG_CHANNEL_ID, ACCENT_COLOR } = require('../config.js');

module.exports = {
    name: 'voiceStateUpdate',
    async execute(oldState, newState) {
        // Ignore bot's own voice state changes
        if (oldState.member.user.bot) return;

        // Ensure the log channel ID is configured
        if (!LOG_CHANNEL_ID || LOG_CHANNEL_ID === 'YOUR_LOG_CHANNEL_ID') {
            console.warn("LOG_CHANNEL_ID is not configured in config.js. Voice state updates will not be logged.");
            return;
        }

        const logChannel = newState.guild.channels.cache.get(LOG_CHANNEL_ID);
        if (!logChannel) {
            console.log(`Warning: Log channel with ID ${LOG_CHANNEL_ID} not found for voiceStateUpdate.`);
            return;
        }

        const embed = new EmbedBuilder()
            .setColor(ACCENT_COLOR)
            .setTimestamp()
            .setFooter({ text: 'ZeroPoint | Voice Log' });

        const user = newState.member.user;

        // User joined a voice channel
        if (!oldState.channelId && newState.channelId) {
            embed.setTitle('🎤 Voice Channel Joined')
                 .setDescription(`${user.tag} joined <#${newState.channelId}>`)
                 .addFields(
                     { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
                     { name: 'Channel', value: `<#${newState.channelId}>`, inline: true }
                 );
            await logChannel.send({ embeds: [embed] });
        }
        // User left a voice channel
        else if (oldState.channelId && !newState.channelId) {
            embed.setTitle('🔌 Voice Channel Left')
                 .setDescription(`${user.tag} left <#${oldState.channelId}>`)
                 .addFields(
                     { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
                     { name: 'Channel', value: `<#${oldState.channelId}>`, inline: true }
                 );
            await logChannel.send({ embeds: [embed] });
        }
        // User switched voice channels
        else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
            embed.setTitle('🔄 Voice Channel Switched')
                 .setDescription(`${user.tag} moved from <#${oldState.channelId}> to <#${newState.channelId}>`)
                 .addFields(
                     { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
                     { name: 'From', value: `<#${oldState.channelId}>`, inline: true },
                     { name: 'To', value: `<#${newState.channelId}>`, inline: true }
                 );
            await logChannel.send({ embeds: [embed] });
        }
        // Mute/Unmute (self or server)
        else if (oldState.selfMute !== newState.selfMute || oldState.serverMute !== newState.serverMute) {
            const muteType = newState.selfMute ? 'Self-Muted' : (newState.serverMute ? 'Server-Muted' : 'Unmuted');
            embed.setTitle(`🔇 Mute Status Changed`)
                 .setDescription(`${user.tag} ${muteType} in <#${newState.channelId}>`)
                 .addFields(
                     { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
                     { name: 'Channel', value: `<#${newState.channelId}>`, inline: true },
                     { name: 'Status', value: muteType, inline: true }
                 );
            await logChannel.send({ embeds: [embed] });
        }
        // Deafen/Undeafen (self or server)
        else if (oldState.selfDeaf !== newState.selfDeaf || oldState.serverDeaf !== newState.serverDeaf) {
            const deafType = newState.selfDeaf ? 'Self-Deafened' : (newState.serverDeaf ? 'Server-Deafened' : 'Undeafened');
            embed.setTitle(`👂 Deafen Status Changed`)
                 .setDescription(`${user.tag} ${deafType} in <#${newState.channelId}>`)
                 .addFields(
                     { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
                     { name: 'Channel', value: `<#${newState.channelId}>`, inline: true },
                     { name: 'Status', value: deafType, inline: true }
                 );
            await logChannel.send({ embeds: [embed] });
        }
    },
};
