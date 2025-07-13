// commands/zeropoint.js
// Provides an overview of ZeroPoint.

const { EmbedBuilder } = require('discord.js');
const { ACCENT_COLOR, COMMISSION_INFO_CHANNEL_ID, WEBSITE_URL, ZEROPOINT_LOGO_URL } = require('../config.js');

module.exports = {
    name: 'zeropoint',
    description: 'Provides a brief overview of ZeroPoint.',

    async execute(message, args) {
        const embed = new EmbedBuilder()
            .setTitle('✨ Welcome to ZeroPoint! ✨')
            .setDescription('Your premier destination for captivating YouTube cinematics, specializing in both passion projects and bespoke commissions for the FiveM community.')
            .setColor(ACCENT_COLOR)
            .addFields(
                { name: 'Our Mission', value: 'We transform concepts into stunning visual narratives, delivering high-quality, immersive experiences that bring your stories to life.', inline: false },
                { name: 'Learn More', value: `Check out our work and commission info in <#${COMMISSION_INFO_CHANNEL_ID}> or on our [Website](${WEBSITE_URL}).`, inline: false }
            )
            .setThumbnail(ZEROPOINT_LOGO_URL)
            .setFooter({ text: 'ZeroPoint | Elevate Your Visuals' });

        await message.channel.send({ embeds: [embed] });
    },
};
