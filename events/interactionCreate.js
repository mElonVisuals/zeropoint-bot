// events/interactionCreate.js
// Handles all incoming interactions (slash commands, buttons, select menus, modals, etc.)

const { InteractionType, PermissionsBitField, EmbedBuilder } = require('discord.js'); // Import InteractionType, PermissionsBitField, EmbedBuilder for clarity and use
const { UNVERIFIED_ROLE_ID, VERIFIED_ROLE_ID, TICKET_LOG_CHANNEL_ID, ACCENT_COLOR } = require('../config.js'); // Import config variables

module.exports = {
    name: 'interactionCreate',
    async execute(client, interaction) { // client is passed as the first argument for events
        // Log the type of interaction for debugging
        console.log(`[DEBUG] Interaction received: Type - ${interaction.type}, ID - ${interaction.id}, Custom ID - ${interaction.customId || 'N/A'}`);

        // Handle Chat Input Commands (Slash Commands)
        // This is the correct way to check for slash commands in Discord.js v14+
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);

            if (!command) {
                console.error(`No slash command matching ${interaction.commandName} was found.`);
                // Reply ephemerally to the user if the command is not found
                return interaction.reply({ content: 'That slash command does not exist!', ephemeral: true });
            }

            try {
                // Execute the slash command
                await command.execute(interaction);
            } catch (error) {
                console.error(`Error executing slash command ${interaction.commandName}:`, error);
                // Handle errors during command execution
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'There was an error while executing this slash command!', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'There was an error while executing this slash command!', ephemeral: true });
                }
            }
            return; // Exit after handling slash command
        }

        // Handle Button Interactions
        else if (interaction.isButton()) {
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
                        console.error(`[ERROR - Verification] UNVERIFIED_ROLE_ID (${UNVERIFIED_ROLE_ID}) not found in cache. Check config.js and bot permissions.`);
                        return interaction.editReply({ content: '❌ Server configuration error: Unverified role not found. Please contact an admin.', ephemeral: true });
                    }
                    if (!verifiedRole) {
                        console.error(`[ERROR - Verification] VERIFIED_ROLE_ID (${VERIFIED_ROLE_ID}) not found in cache. Check config.js and bot permissions.`);
                        return interaction.editReply({ content: '❌ Server configuration error: Verified role not found. Please contact an admin.', ephemeral: true });
                    }

                    // Check if the user already has the verified role
                    if (member.roles.cache.has(VERIFIED_ROLE_ID)) {
                        console.log(`[Verification] ${member.user.tag} already has the verified role.`);
                        return interaction.editReply({ content: '✅ You are already verified!', ephemeral: true });
                    }

                    // Check if the bot has permissions to manage roles
                    if (!guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                        console.error(`[ERROR - Verification] Bot lacks 'Manage Roles' permission in guild ${guild.name}.`);
                        return interaction.editReply({ content: '❌ Bot does not have permission to manage roles. Please grant `Manage Roles` permission to the bot.', ephemeral: true });
                    }

                    // Check if the bot's role is higher than the roles it's trying to manage
                    if (unverifiedRole.position >= guild.members.me.roles.highest.position ||
                        verifiedRole.position >= guild.members.me.roles.highest.position) {
                        console.error(`[ERROR - Verification] Bot's highest role is not above the unverified or verified role.`);
                        return interaction.editReply({ content: '❌ Bot\'s role is too low to manage the verification roles. Please move the bot\'s role higher in the role list.', ephemeral: true });
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
            // Add more else if blocks for other custom button IDs here
        }
        // Handle Select Menu Interactions (StringSelectMenu, UserSelectMenu, etc.)
        else if (interaction.isStringSelectMenu() || interaction.isUserSelectMenu() || interaction.isRoleSelectMenu() || interaction.isChannelSelectMenu() || interaction.isMentionableSelectMenu()) {
            console.log(`[DEBUG] Select menu interaction received: Custom ID - ${interaction.customId}, Values - ${interaction.values.join(', ')}`);
            // Add logic here to handle specific select menus based on their customId
            if (!interaction.replied && !interaction.deferred) {
                // await interaction.reply({ content: `You selected: ${interaction.values.join(', ')}`, ephemeral: true });
                console.log(`[INFO] Unhandled select menu interaction with customId: ${interaction.customId}`);
            }
        }
        // Handle Modal Submits
        else if (interaction.isModalSubmit()) {
            console.log(`[DEBUG] Modal submit interaction received: Custom ID - ${interaction.customId}`);
            // Add logic here to handle specific modal submissions based on their customId
            if (!interaction.replied && !interaction.deferred) {
                // await interaction.reply({ content: 'Modal submitted!', ephemeral: true });
                console.log(`[INFO] Unhandled modal submission with customId: ${interaction.customId}`);
            }
        }
        // Handle other types of interactions if necessary
        else {
            console.log(`[DEBUG] Unhandled interaction type: ${interaction.type}`);
            // Optionally reply to unhandled interactions to prevent them from timing out
            if (!interaction.replied && !interaction.deferred) {
                // await interaction.reply({ content: 'This interaction type is not currently handled.', ephemeral: true });
                console.log(`[INFO] Unhandled interaction type: ${interaction.type} (no reply sent to user)`);
            }
        }
    },
};
