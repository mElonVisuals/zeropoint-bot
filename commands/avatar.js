// commands/avatar.js
// Gets a user's avatar.

const { EmbedBuilder } = require('discord.js');
const { ACCENT_COLOR } = require('../config.js');

module.exports = {
    name: 'avatar',
    description: '🖼️ Displays a user\'s avatar.',
    async execute(message, args) {
        const target = message.mentions.users.first() || message.author; // Get mentioned user or the command invoker

        const embed = new EmbedBuilder()
            .setTitle(`${target.username}'s Avatar`)
            .setColor(ACCENT_COLOR)
            .setImage(target.displayAvatarURL({ dynamic: true, size: 512 })) // Display a larger version of the avatar
            .setFooter({ text: 'ZeroPoint | Avatar Display' })
            .setTimestamp();

        await message.channel.send({ embeds: [embed] });
    },
};
