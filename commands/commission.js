// commands/commission.js
// Provides direct information on how to start a commission.

const { EmbedBuilder } = require('discord.js');
const { COMMISSION_INFO_CHANNEL_ID, ACCENT_COLOR, ZEROPOINT_LOGO_URL } = require('../config.js');

module.exports = {
    name: 'commission',
    description: '🎬 Provides information on how to start a cinematic commission.',
    async execute(message, args) {
        const embed = new EmbedBuilder()
            .setTitle('✨ Start Your ZeroPoint Commission!')
            .setDescription('Ready to bring your vision to life? Our team is here to help you create stunning cinematics.')
            .setColor(ACCENT_COLOR)
            .addFields(
                {
                    name: 'How to Get Started:',
                    value: `To discuss your project and get a personalized quote, please open a ticket with our bot in <#${COMMISSION_INFO_CHANNEL_ID}>.`,
                    inline: false
                },
                {
                    name: 'What We Offer:',
                    value: 'Custom FiveM Cinematics, Content Creator Intros/Outros, Short-Form Visual Narratives, and more!',
                    inline: false
                }
            )
            .setThumbnail(ZEROPOINT_LOGO_URL)
            .setFooter({ text: 'ZeroPoint | Your Cinematic Journey Awaits' });

        await message.channel.send({ embeds: [embed] });
    },
};
