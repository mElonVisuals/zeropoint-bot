// commands/ticket.js
// Implements a simple ticket system with button interactions.

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionsBitField } = require('discord.js');
const { ACCENT_COLOR, TICKET_CATEGORY_ID, TICKET_LOG_CHANNEL_ID, STAFF_ROLE_ID, ZEROPOINT_LOGO_URL } = require('../config.js');

module.exports = {
    name: 'ticket',
    description: '🎫 Sets up the ticket creation panel.',
    async execute(message, args) {
        // Ensure only users with Manage Channels permission can set up the panel
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return message.reply({ content: '❌ You do not have permission to set up the ticket panel. You need the `Manage Channels` permission.', ephemeral: true });
        }

        // Basic validation for config IDs
        if (!TICKET_CATEGORY_ID || TICKET_CATEGORY_ID === 'YOUR_TICKET_CATEGORY_ID') {
            return message.reply({ content: '❌ Ticket category ID is not configured in `config.js`. Please set `TICKET_CATEGORY_ID`.', ephemeral: true });
        }
        if (!TICKET_LOG_CHANNEL_ID || TICKET_LOG_CHANNEL_ID === 'YOUR_TICKET_LOG_CHANNEL_ID') {
            return message.reply({ content: '❌ Ticket log channel ID is not configured in `config.js`. Please set `TICKET_LOG_CHANNEL_ID`.', ephemeral: true });
        }
        if (!STAFF_ROLE_ID || STAFF_ROLE_ID === 'YOUR_STAFF_ROLE_ID') {
            return message.reply({ content: '❌ Staff Role ID is not configured in `config.js`. Please set `STAFF_ROLE_ID`.', ephemeral: true });
        }

        const ticketPanelEmbed = new EmbedBuilder()
            .setTitle('🎫 ZeroPoint Support Tickets')
            .setDescription('Need assistance, have a commission inquiry, or a private question? Click the button below to create a new ticket.')
            .setColor(ACCENT_COLOR)
            .addFields(
                { name: 'How it Works:', value: 'Clicking the button will create a private channel visible only to you and our staff. Please explain your issue clearly once the ticket is open.', inline: false }
            )
            .setThumbnail(ZEROPOINT_LOGO_URL)
            .setFooter({ text: 'ZeroPoint | Your Direct Line to Our Team' });

        const createTicketButton = new ButtonBuilder()
            .setCustomId('create_ticket')
            .setLabel('Create Ticket')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('➕'); // Plus emoji

        const row = new ActionRowBuilder().addComponents(createTicketButton);

        // Send the ticket panel message
        const panelMessage = await message.channel.send({
            embeds: [ticketPanelEmbed],
            components: [row]
        });

        // Delete the command message to keep the channel clean
        await message.delete().catch(console.error);

        // --- Collector for Ticket Creation ---
        const collector = panelMessage.createMessageComponentCollector({
            filter: i => i.customId === 'create_ticket',
            time: 86400000 // Collector lasts for 24 hours (24 * 60 * 60 * 1000 ms)
        });

        collector.on('collect', async interaction => {
            console.log(`[DEBUG - TICKET] Create ticket button collected by ${interaction.user.tag}`);
            try {
                await interaction.deferReply({ ephemeral: true }); // Acknowledge interaction immediately

                const guild = interaction.guild;
                const user = interaction.user;

                // Check if user already has an open ticket
                const existingChannel = guild.channels.cache.find(c =>
                    c.name === `ticket-${user.username.toLowerCase().replace(/[^a-z0-9-]/g, '')}` &&
                    c.parentId === TICKET_CATEGORY_ID
                );

                if (existingChannel) {
                    console.log(`[DEBUG - TICKET] User ${user.tag} already has an open ticket.`);
                    return interaction.editReply({ content: `You already have an open ticket: <#${existingChannel.id}>`, ephemeral: true });
                }

                try {
                    console.log(`[DEBUG - TICKET] Attempting to create channel for ${user.tag}`);
                    // Create the ticket channel
                    const ticketChannel = await guild.channels.create({
                        name: `ticket-${user.username.toLowerCase().replace(/[^a-z0-9-]/g, '')}`, // Sanitize username for channel name
                        type: ChannelType.GuildText,
                        parent: TICKET_CATEGORY_ID,
                        permissionOverwrites: [
                            {
                                id: guild.id, // @everyone role
                                deny: [PermissionsBitField.Flags.ViewChannel], // Deny everyone from viewing
                            },
                            {
                                id: user.id, // The user who created the ticket
                                allow: [
                                    PermissionsBitField.Flags.ViewChannel,
                                    PermissionsBitField.Flags.SendMessages,
                                    PermissionsBitField.Flags.ReadMessageHistory
                                ],
                            },
                            {
                                id: STAFF_ROLE_ID, // Your staff role
                                allow: [
                                    PermissionsBitField.Flags.ViewChannel,
                                    PermissionsBitField.Flags.SendMessages,
                                    PermissionsBitField.Flags.ReadMessageHistory
                                ],
                            },
                            {
                                id: interaction.client.user.id, // The bot itself
                                allow: [
                                    PermissionsBitField.Flags.ViewChannel,
                                    PermissionsBitField.Flags.SendMessages,
                                    PermissionsBitField.Flags.ReadMessageHistory,
                                    PermissionsBitField.Flags.ManageChannels // To delete the channel later
                                ],
                            },
                        ],
                    });
                    console.log(`[DEBUG - TICKET] Channel created: ${ticketChannel.name} (${ticketChannel.id})`);

                    // Send initial message in the ticket channel
                    const ticketWelcomeEmbed = new EmbedBuilder()
                        .setTitle(`👋 Welcome to your ticket, ${user.username}!`)
                        .setDescription('Our staff will be with you shortly. Please describe your issue or inquiry in detail below.')
                        .setColor(ACCENT_COLOR)
                        .setFooter({ text: 'ZeroPoint | Ticket Support' })
                        .setTimestamp();

                    const closeTicketButton = new ButtonBuilder()
                        .setCustomId('close_ticket')
                        .setLabel('Close Ticket')
                        .setStyle(ButtonStyle.Danger)
                        .setEmoji('🔒'); // Lock emoji

                    const closeRow = new ActionRowBuilder().addComponents(closeTicketButton);

                    console.log(`[DEBUG - TICKET] Sending welcome message to ticket channel.`);
                    await ticketChannel.send({
                        content: `${user.toString()} <@&${STAFF_ROLE_ID}>`, // Mention user and staff role
                        embeds: [ticketWelcomeEmbed],
                        components: [closeRow]
                    });

                    console.log(`[DEBUG - TICKET] Replying to interaction: Ticket created.`);
                    await interaction.editReply({ content: `✅ Your ticket has been created: <#${ticketChannel.id}>`, ephemeral: true });

                    // Log ticket creation
                    const logChannel = guild.channels.cache.get(TICKET_LOG_CHANNEL_ID);
                    if (logChannel) {
                        const logEmbed = new EmbedBuilder()
                            .setTitle('🎫 Ticket Created')
                            .setColor(ACCENT_COLOR)
                            .addFields(
                                { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
                                { name: 'Channel', value: `<#${ticketChannel.id}>`, inline: true }
                            )
                            .setTimestamp()
                            .setFooter({ text: 'ZeroPoint | Ticket Log' });
                        console.log(`[DEBUG - TICKET] Logging ticket creation to log channel.`);
                        await logChannel.send({ embeds: [logEmbed] });
                    }

                    // --- Collector for Ticket Closure ---
                    const closeCollector = ticketChannel.createMessageComponentCollector({
                        filter: i => i.customId === 'close_ticket',
                        time: 86400000 * 7 // Ticket can stay open for 7 days
                    });

                    closeCollector.on('collect', async closeInteraction => {
                        console.log(`[DEBUG - TICKET] Close ticket button collected by ${closeInteraction.user.tag}`);
                        try {
                            await closeInteraction.deferReply({ ephemeral: true }); // Acknowledge interaction immediately

                            // Only allow ticket creator or staff to close
                            if (closeInteraction.user.id !== user.id && !closeInteraction.member.roles.cache.has(STAFF_ROLE_ID)) {
                                console.log(`[DEBUG - TICKET] User ${closeInteraction.user.tag} tried to close ticket without permission.`);
                                return closeInteraction.editReply({ content: '❌ Only the ticket creator or staff can close this ticket.', ephemeral: true });
                            }

                            console.log(`[DEBUG - TICKET] User ${closeInteraction.user.tag} initiated ticket closure.`);
                            await closeInteraction.editReply({ content: '🔒 Closing ticket...', ephemeral: true });

                            // Log ticket closure
                            if (logChannel) {
                                const logEmbed = new EmbedBuilder()
                                    .setTitle('Ticket Closed')
                                    .setColor(0xFF0000) // Red color for closed
                                    .addFields(
                                        { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
                                        { name: 'Channel', value: `#${ticketChannel.name} (${ticketChannel.id})`, inline: true },
                                        { name: 'Closed By', value: `${closeInteraction.user.tag} (${closeInteraction.user.id})`, inline: false }
                                    )
                                    .setTimestamp()
                                    .setFooter({ text: 'ZeroPoint | Ticket Log' });
                                console.log(`[DEBUG - TICKET] Logging ticket closure to log channel.`);
                                await logChannel.send({ embeds: [logEmbed] });
                            }

                            // Delete the channel after a short delay
                            console.log(`[DEBUG - TICKET] Deleting ticket channel in 5 seconds.`);
                            await ticketChannel.send('This ticket will be closed and deleted in 5 seconds.');
                            setTimeout(() => ticketChannel.delete().catch(e => console.error(`[ERROR - TICKET] Failed to delete ticket channel:`, e)), 5000);
                        } catch (error) {
                            console.error(`[ERROR - TICKET] Error during ticket closure for ${closeInteraction.user.tag}:`, error);
                            if (!closeInteraction.replied && !closeInteraction.deferred) {
                                await closeInteraction.reply({ content: '❌ An error occurred while trying to close the ticket. Please try again.', ephemeral: true }).catch(e => console.error("Failed to send follow-up reply for close error:", e));
                            }
                        }
                    });

                    closeCollector.on('end', async collected => {
                        console.log(`[DEBUG - TICKET] Close ticket collector ended. Collected ${collected.size} interactions.`);
                        // If ticket wasn't closed by button, disable the button
                        if (ticketChannel.deletable && ticketChannel.messages) { // Check if channel still exists and can send messages
                            const lastMessage = await ticketChannel.messages.fetch({ limit: 1 }).then(msg => msg.first()).catch(e => console.error("Failed to fetch last message for disabling close button:", e));
                            if (lastMessage && lastMessage.components.length > 0 && lastMessage.components[0].components[0].customId === 'close_ticket') {
                                const disabledCloseRow = new ActionRowBuilder().addComponents(
                                    new ButtonBuilder()
                                        .setCustomId('close_ticket_disabled')
                                        .setLabel('Ticket Expired')
                                        .setStyle(ButtonStyle.Secondary)
                                        .setEmoji('⛔')
                                        .setDisabled(true)
                                );
                                await lastMessage.edit({ components: [disabledCloseRow] }).catch(e => console.error("Failed to disable close ticket button:", e));
                                console.log(`[DEBUG - TICKET] Close ticket button disabled.`);
                            }
                        }
                    });


                } catch (error) {
                    console.error('Error creating ticket channel:', error);
                    await interaction.editReply({ content: '❌ There was an error creating your ticket. Please try again later.', ephemeral: true });
                }
            } catch (error) {
                console.error(`[ERROR - TICKET] Error during ticket creation for ${interaction.user.tag}:`, error);
                // If deferReply already happened, use editReply, otherwise reply
                if (!interaction.replied && !interaction.deferred) {
                     await interaction.reply({ content: '❌ An unexpected error occurred. Please try again later.', ephemeral: true }).catch(e => console.error("Failed to send initial error reply:", e));
                } else {
                     await interaction.editReply({ content: '❌ An unexpected error occurred. Please try again later.', ephemeral: true }).catch(e => console.error("Failed to send editReply for error:", e));
                }
            }
        });

        collector.on('end', async collected => {
            console.log(`[DEBUG - TICKET] Ticket panel collector ended. Collected ${collected.size} interactions.`);
            // Disable the create ticket button when the panel collector expires
            if (panelMessage.editable) {
                const disabledRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('create_ticket_disabled')
                        .setLabel('Ticket System Offline')
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji('⛔')
                        .setDisabled(true)
                );
                await panelMessage.edit({ components: [disabledRow] }).catch(e => console.error("Failed to disable ticket panel button:", e));
                console.log(`[DEBUG - TICKET] Ticket panel button disabled.`);
            }
        });
    },
};
