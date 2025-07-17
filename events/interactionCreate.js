// events/interactionCreate.js
// This event fires when a user interacts with your bot (e.g., button click, slash command).

const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const { UNVERIFIED_ROLE_ID, VERIFIED_ROLE_ID, TICKET_LOG_CHANNEL_ID, ACCENT_COLOR } = require('../config.js');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        // Handle slash commands
        if (interaction.isCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(`Error executing slash command ${interaction.commandName}:`, error);
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
            return; // Exit after handling slash command
        }

        // Handle button interactions
        if (interaction.isButton()) {
            console.log(`[DEBUG - Interaction] Button interaction received: ${interaction.customId} by ${interaction.user.tag}`);

            // --- Verification Button Logic ---
            if (interaction.customId === 'verify_button') {
                try {
                    // Defer the reply immediately to prevent "interaction failed" timeout
                    if (!interaction.deferred && !interaction.replied) {
                        await interaction.deferReply({ ephemeral: true });
                        console.log(`[DEBUG - Verification] DeferReply for verify_button successful.`);
                    }

                    const member = interaction.member;
                    const guild = interaction.guild;

                    if (!member || !guild) {
                        console.error("[ERROR - Verification] Member or Guild not found in interaction.");
                        return interaction.editReply({ content: '❌ Could not find your member data or server. Please try again.', ephemeral: true });
                    }

                    const unverifiedRole = guild.roles.cache.get(UNVERIFIED_ROLE_ID);
                    const verifiedRole = guild.roles.cache.get(VERIFIED_ROLE_ID);

                    if (!unverifiedRole) {
                        console.error(`[ERROR - Verification] UNVERIFIED_ROLE_ID (${UNVERIFIED_ROLE_ID}) not found in cache.`);
                        return interaction.editReply({ content: '❌ Server configuration error: Unverified role not found. Please contact an admin.', ephemeral: true });
                    }
                    if (!verifiedRole) {
                        console.error(`[ERROR - Verification] VERIFIED_ROLE_ID (${VERIFIED_ROLE_ID}) not found in cache.`);
                        return interaction.editReply({ content: '❌ Server configuration error: Verified role not found. Please contact an admin.', ephemeral: true });
                    }

                    // Check if the user already has the verified role
                    if (member.roles.cache.has(VERIFIED_ROLE_ID)) {
                        console.log(`[Verification] ${member.user.tag} already has the verified role.`);
                        return interaction.editReply({ content: '✅ You are already verified!', ephemeral: true });
                    }

                    // Check if the user has the unverified role (they should if they just joined)
                    if (member.roles.cache.has(UNVERIFIED_ROLE_ID)) {
                        await member.roles.remove(unverifiedRole, 'User verified.');
                        console.log(`[Verification] Removed unverified role from ${member.user.tag}.`);
                    }

                    await member.roles.add(verifiedRole, 'User verified.');
                    console.log(`[Verification] Added verified role to ${member.user.tag}.`);

                    await interaction.editReply({ content: '🎉 You have been successfully verified! Welcome to the server!', ephemeral: true });
                    console.log(`[Verification] ${member.user.tag} successfully verified.`);

                    // Log verification to a designated channel if configured
                    const logChannel = guild.channels.cache.get(TICKET_LOG_CHANNEL_ID); // Re-using ticket log channel for verification logs
                    if (logChannel) {
                        const logEmbed = new EmbedBuilder()
                            .setTitle('✅ Member Verified')
                            .setColor(ACCENT_COLOR)
                            .addFields(
                                { name: 'User', value: `${member.user.tag} (${member.id})`, inline: true },
                                { name: 'Verified At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                            )
                            .setTimestamp()
                            .setFooter({ text: 'ZeroPoint | Verification Log' });
                        await logChannel.send({ embeds: [logEmbed] }).catch(e => console.error("Failed to send verification log:", e));
                    }

                } catch (error) {
                    console.error(`[ERROR - Verification] Error during verification for ${interaction.user.tag}:`, error);
                    // Ensure a reply is sent even on error
                    if (!interaction.replied && !interaction.deferred) {
                        await interaction.reply({ content: '❌ An error occurred during verification. Please try again later or contact an admin.', ephemeral: true });
                    } else {
                        await interaction.editReply({ content: '❌ An error occurred during verification. Please try again later or contact an admin.', ephemeral: true });
                    }
                }
            }

            // --- Other Button Interactions (e.g., from ticket.js) ---
            else if (interaction.customId === 'create_ticket') {
                // This part should ideally be handled by the ticket.js collector,
                // but if the collector expires, this might catch it.
                // For robust design, ensure the collector in ticket.js handles its interactions.
                // If you want to handle it here as a fallback, you'd duplicate the logic from ticket.js
                // or emit an event for ticket.js to handle.
                console.log(`[DEBUG - Interaction] create_ticket button clicked outside of its active collector.`);
                if (!interaction.deferred && !interaction.replied) {
                    await interaction.reply({ content: 'The ticket creation panel has expired. Please ask a moderator to set up a new one.', ephemeral: true });
                }
            }
            else if (interaction.customId === 'close_ticket') {
                // Similar to create_ticket, this should be handled by the collector in ticket.js
                console.log(`[DEBUG - Interaction] close_ticket button clicked outside of its active collector.`);
                if (!interaction.deferred && !interaction.replied) {
                    await interaction.reply({ content: 'This ticket has already been closed or the close button has expired.', ephemeral: true });
                }
            }
            // Add more else if blocks for other custom button IDs
        }

        // Handle other interaction types (e.g., context menus, select menus) if needed
    },
};
