// commands/serverinfo.js
// Displays information about the Discord server.

const { EmbedBuilder } = require('discord.js');
const { ACCENT_COLOR } = require('../config.js');

module.exports = {
    name: 'serverinfo',
    description: '📊 Displays information about the Discord server.',
    async execute(message, args) {
        const guild = message.guild; // The guild (server) where the command was used

        if (!guild) {
            return message.reply({ content: '❌ This command can only be used in a server.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle(`Information about ${guild.name}`)
            .setColor(ACCENT_COLOR)
            .setThumbnail(guild.iconURL({ dynamic: true, size: 256 }))
            .addFields(
                { name: 'Server Name', value: guild.name, inline: true },
                { name: 'Server ID', value: guild.id, inline: true },
                { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
                { name: 'Members', value: guild.memberCount.toString(), inline: true },
                { name: 'Channels', value: guild.channels.cache.size.toString(), inline: true },
                { name: 'Roles', value: guild.roles.cache.size.toString(), inline: true },
                { name: 'Creation Date', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: false },
                { name: 'Verification Level', value: guild.verificationLevel.toString(), inline: true },
                { name: 'Boosts', value: guild.premiumSubscriptionCount.toString(), inline: true }
            )
            .setFooter({ text: 'ZeroPoint | Server Details' })
            .setTimestamp();

        await message.channel.send({ embeds: [embed] });
    },
};
