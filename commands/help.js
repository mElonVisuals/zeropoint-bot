// commands/help.js
// Displays a paginated list of all available commands.

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, InteractionResponseFlags } = require('discord.js'); // Added InteractionResponseFlags
const { PREFIX, ACCENT_COLOR } = require('../config.js');

// Define how many commands per page
const COMMANDS_PER_PAGE = 5; // Adjusted to accommodate more vertical space per command

module.exports = {
    name: 'help',
    description: '📜 Displays a paginated list of all available commands.',
    async execute(message, args) {
        const commands = Array.from(message.client.commands.values()); // Get all commands as an array

        // Filter out commands that might not have a description or are internal
        const publicCommands = commands.filter(cmd => cmd.description && !cmd.hidden);

        const totalPages = Math.ceil(publicCommands.length / COMMANDS_PER_PAGE);
        let currentPage = 0;

        // Function to create an embed for a specific page
        const createHelpEmbed = (page) => {
            const start = page * COMMANDS_PER_PAGE;
            const end = start + COMMANDS_PER_PAGE;
            const commandsToShow = publicCommands.slice(start, end);

            const embed = new EmbedBuilder()
                .setTitle('📚 ZeroPoint Bot Commands')
                .setDescription(`My prefix is \`${PREFIX}\`\nNavigate through commands using the buttons below.`)
                .setColor(ACCENT_COLOR)
                .setThumbnail('https://melonvisuals.me/test/zeropoint.png')
                .setFooter({ text: `Page ${page + 1} / ${totalPages} | ZeroPoint Command List` });

            if (commandsToShow.length === 0) {
                embed.addFields({ name: 'No Commands Found', value: 'There are no commands to display on this page.' });
            } else {
                commandsToShow.forEach((command, index) => {
                    embed.addFields({
                        name: `\`${PREFIX}${command.name}\``,
                        value: command.description || 'No description provided.',
                        inline: false // Changed to false for better readability
                    });
                    // Add a blank field for spacing between commands, except after the last one on the page
                    if (index < commandsToShow.length - 1) {
                        embed.addFields({ name: '\u200B', value: '\u200B', inline: false }); // Unicode zero-width space for blank field
                    }
                });
            }
            return embed;
        };

        // Function to create action row with buttons
        const createButtons = (page) => {
            return new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('help_previous')
                        .setLabel('⬅️ Previous')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page === 0), // Disable 'Previous' on the first page
                    new ButtonBuilder()
                        .setCustomId('help_next')
                        .setLabel('Next ➡️')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page === totalPages - 1) // Disable 'Next' on the last page
                );
        };

        // Send the initial help message with the first page and buttons
        const initialEmbed = createHelpEmbed(currentPage);
        const initialButtons = createButtons(currentPage);

        const replyMessage = await message.channel.send({
            embeds: [initialEmbed],
            components: [initialButtons],
            fetchReply: true // Important to fetch the message to create a collector on it
        });

        // Create a collector to listen for button interactions on this specific message
        const collector = replyMessage.createMessageComponentCollector({
            filter: i => i.customId.startsWith('help_') && i.user.id === message.author.id, // Only collect interactions from the command invoker
            time: 60000 // Collector expires after 60 seconds
        });

        collector.on('collect', async i => {
            console.log(`[DEBUG - HELP] Button '${i.customId}' collected by ${i.user.tag}`);
            try {
                console.log(`[DEBUG - HELP] Attempting deferUpdate for '${i.customId}'`);
                await i.deferUpdate(); // Acknowledge the interaction immediately
                console.log(`[DEBUG - HELP] deferUpdate successful for '${i.customId}'`);

                if (i.customId === 'help_next') {
                    currentPage++;
                } else if (i.customId === 'help_previous') {
                    currentPage--;
                }

                console.log(`[DEBUG - HELP] Updating to page ${currentPage + 1}`);
                const newEmbed = createHelpEmbed(currentPage);
                const newButtons = createButtons(currentPage);

                // Update the message with the new embed and button states
                await i.editReply({
                    embeds: [newEmbed],
                    components: [newButtons]
                });
                console.log(`[DEBUG - HELP] Message updated successfully for page ${currentPage + 1}`);
            } catch (error) {
                console.error(`[ERROR - HELP] Failed to update help message for ${i.user.tag} on button '${i.customId}':`, error);
                // Try to send a follow-up if deferUpdate failed or subsequent editReply failed
                if (!i.replied && !i.deferred) {
                    await i.reply({ content: '❌ An error occurred while updating the help page. Please try again.', flags: [InteractionResponseFlags.Ephemeral] }).catch(e => console.error("Failed to send follow-up reply:", e));
                }
            }
        });

        collector.on('end', async collected => {
            console.log(`[DEBUG - HELP] Help collector ended. Collected ${collected.size} interactions.`);
            // Disable all buttons when the collector expires
            const disabledButtons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('help_previous_disabled')
                        .setLabel('⬅️ Previous')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('help_next_disabled')
                        .setLabel('Next ➡️')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true)
                );
            // Only edit if the message hasn't been deleted
            if (replyMessage.editable) {
                await replyMessage.edit({ components: [disabledButtons] }).catch(e => console.error("Failed to disable help buttons:", e));
            }
        });
    },
};
