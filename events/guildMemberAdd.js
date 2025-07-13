// events/guildMemberAdd.js
// This event fires when a new member joins the server.

const { EmbedBuilder, Partials } = require('discord.js');
const { WELCOME_CHANNEL_ID, RULES_CHANNEL_ID, INTRODUCTIONS_CHANNEL_ID, YOUTUBE_CHANNEL_URL, ZEROPOINT_LOGO_URL, ACCENT_COLOR } = require('../config.js');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        try {
            // If the member is a partial, fetch the full member object.
            // This is crucial if SERVER MEMBERS INTENT is enabled but data is still partial.
            if (member.partial) {
                member = await member.fetch();
            }

            // After fetching (or if not partial), check if guild is available.
            if (!member.guild) {
                console.error(`Error in guildMemberAdd: 'guild' property is still undefined for member ${member.user.tag} after fetching. SERVER MEMBERS INTENT might not be fully applied or there's another issue.`);
                return;
            }

            // Ensure the welcome channel ID is configured
            if (!WELCOME_CHANNEL_ID || WELCOME_CHANNEL_ID === 'YOUR_WELCOME_CHANNEL_ID') {
                console.warn("WELCOME_CHANNEL_ID is not configured in config.js. Welcome message will not be sent.");
                return;
            }

            const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
            if (channel) {
                const embed = new EmbedBuilder()
                    .setTitle(`👋 Welcome to ZeroPoint, ${member.user.username}!`)
                    .setDescription(`We're thrilled to have you join our community, the premier destination for captivating YouTube cinematics and bespoke commissions for the FiveM community. Get ready to explore the art of visual storytelling!`)
                    .setColor(ACCENT_COLOR)
                    .addFields(
                        {
                            name: '🚀 Get Started:',
                            value: `Head over to <#${RULES_CHANNEL_ID}> to review our guidelines.\nIntroduce yourself in <#${INTRODUCTIONS_CHANNEL_ID}>!`,
                            inline: false
                        },
                        {
                            name: '🎬 Explore Our Work:',
                            value: `Check out our latest cinematics on our YouTube channel: [ZeroPoint YouTube](${YOUTUBE_CHANNEL_URL})`,
                            inline: false
                        }
                    )
                    .setThumbnail(ZEROPOINT_LOGO_URL)
                    .setFooter({ text: 'ZeroPoint | Your Cinematic Journey Begins' });

                await channel.send({ content: `Welcome ${member.toString()}!`, embeds: [embed] });
            } else {
                console.log(`Warning: Welcome channel with ID ${WELCOME_CHANNEL_ID} not found in guild ${member.guild.name}.`);
            }
        } catch (error) {
            console.error(`An error occurred in guildMemberAdd for ${member.user.tag}:`, error);
            // This catch block will handle errors during fetching or other operations within the event.
        }
    },
};
