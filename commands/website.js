// commands/website.js
// Provides a link to the ZeroPoint website.

const { EmbedBuilder } = require('discord.js');
const { WEBSITE_URL, ACCENT_COLOR, ZEROPOINT_LOGO_URL } = require('../config.js');

module.exports = {
    name: 'website',
    description: 'Provides a link to the ZeroPoint official website.',
    async execute(message, args) {
        const embed = new EmbedBuilder()
            .setTitle('🌐 Visit the ZeroPoint Website!')
            .setDescription(`Explore our portfolio, services, and more on our official website:`)
            .setURL(WEBSITE_URL) // Make the title a clickable link
            .setColor(ACCENT_COLOR)
            .addFields({
                name: 'Link:',
                value: `[ZeroPoint Official Website](${WEBSITE_URL})`,
                inline: false
            })
            .setThumbnail(ZEROPOINT_LOGO_URL)
            .setFooter({ text: 'ZeroPoint | Your Cinematic Journey' });

        await message.channel.send({ embeds: [embed] });
    },
};
