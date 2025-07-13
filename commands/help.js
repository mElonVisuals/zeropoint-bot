// commands/help.js
// Lists all available commands.

const { EmbedBuilder } = require('discord.js');
const { PREFIX, ACCENT_COLOR } = require('../config.js');

module.exports = {
    name: 'help',
    description: '📜 Displays a list of all available commands.',
    async execute(message, args) {
        const commands = message.client.commands; // Access the commands Collection from the client

        const embed = new EmbedBuilder()
            .setTitle('📚 ZeroPoint Bot Commands')
            .setDescription(`My prefix is \`${PREFIX}\`\nHere's a list of all my commands:`)
            .setColor(ACCENT_COLOR)
            .setThumbnail('https://melonvisuals.me/test/zeropoint.png')
            .setFooter({ text: 'ZeroPoint | Command List' });

        // Iterate over the commands and add them to the embed fields
        commands.forEach(command => {
            embed.addFields({
                name: `\`${PREFIX}${command.name}\``,
                value: command.description || 'No description provided.',
                inline: true // Display commands in a compact grid
            });
        });

        await message.channel.send({ embeds: [embed] });
    },
};
