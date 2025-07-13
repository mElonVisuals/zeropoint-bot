// events/guildMemberRemove.js
// This event fires when a member leaves or is removed from the server.

const { EmbedBuilder, Partials } = require('discord.js');
const { FAREWELL_CHANNEL_ID, ACCENT_COLOR } = require('../config.js');

module.exports = {
    name: 'guildMemberRemove',
    async execute(member) {
        console.log(`[DEBUG] guildMemberRemove event triggered for user: ${member.user.tag} (ID: ${member.user.id})`);
        console.log(`[DEBUG] Initial member.partial: ${member.partial}`);
        console.log(`[DEBUG] Initial member.guild: ${member.guild ? 'Defined' : 'Undefined'}`);

        try {
            // If the member is a partial, fetch the full member object.
            // This is crucial if SERVER MEMBERS INTENT is enabled but data is still partial.
            if (member.partial) {
                console.log(`[DEBUG] Member is partial. Attempting to fetch full member object.`);
                member = await member.fetch();
                console.log(`[DEBUG] Member fetched. New member.partial: ${member.partial}`);
                console.log(`[DEBUG] New member.guild after fetch: ${member.guild ? 'Defined' : 'Undefined'}`);
            }

            // After fetching (or if not partial), check if guild is available.
            if (!member.guild) {
                console.error(`Error in guildMemberRemove: 'guild' property is still undefined for member ${member.user.tag} (ID: ${member.user.id}) after fetching. This strongly indicates 'SERVER MEMBERS INTENT' is not fully applied or there's a deeper issue.`);
                return;
            }

            // Ensure the farewell channel ID is configured
            if (!FAREWELL_CHANNEL_ID || FAREWELL_CHANNEL_ID === 'YOUR_FAREWELL_CHANNEL_ID') {
                console.warn("FAREWELL_CHANNEL_ID is not configured in config.js. Farewell message will not be sent.");
                return;
            }

            const channel = member.guild.channels.cache.get(FAREWELL_CHANNEL_ID);
            if (channel) {
                const embed = new EmbedBuilder()
                    .setTitle(`👋 Goodbye, ${member.user.username}!`)
                    .setDescription(`We're sad to see **${member.user.username}** leave the ZeroPoint community. We hope to see you again soon!`)
                    .setColor(ACCENT_COLOR)
                    .setThumbnail(member.user.displayAvatarURL({ dynamic: true })) // Show the user's avatar
                    .setFooter({ text: 'ZeroPoint | Member Departed' })
                    .setTimestamp(); // Add a timestamp

                await channel.send({ embeds: [embed] });
            } else {
                console.log(`Warning: Farewell channel with ID ${FAREWELL_CHANNEL_ID} not found in guild ${member.guild.name}.`);
            }
        } catch (error) {
            console.error(`An error occurred in guildMemberRemove for ${member.user.tag} (ID: ${member.user.id}):`, error);
            // This catch block will handle errors during fetching or other operations within the event.
        }
    },
};
