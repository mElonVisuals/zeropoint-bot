// commands/userinfo.js
// Displays information about a user.

const { EmbedBuilder } = require('discord.js');
const { ACCENT_COLOR } = require('../config.js');

module.exports = {
    name: 'userinfo',
    description: '👤 Displays information about a user.',
    async execute(message, args) {
        const target = message.mentions.users.first() || message.author; // Get mentioned user or the command invoker
        const member = message.guild.members.cache.get(target.id); // Get guild member object for roles, join date etc.

        if (!member) {
            return message.reply({ content: '❌ Could not find that user in this server.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle(`Information about ${target.username}`)
            .setColor(ACCENT_COLOR)
            .setThumbnail(target.displayAvatarURL({ dynamic: true, size: 256 }))
            .addFields(
                { name: 'Tag', value: target.tag, inline: true },
                { name: 'ID', value: target.id, inline: true },
                { name: 'Nickname', value: member.nickname || 'None', inline: true },
                { name: 'Joined Discord', value: `<t:${Math.floor(target.createdTimestamp / 1000)}:F>`, inline: true },
                { name: 'Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: true },
                { name: 'Roles', value: member.roles.cache.map(role => role.name).join(', ') || 'None', inline: false }
            )
            .setFooter({ text: 'ZeroPoint | User Details' })
            .setTimestamp();

        await message.channel.send({ embeds: [embed] });
    },
};
