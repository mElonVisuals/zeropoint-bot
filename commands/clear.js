// commands/clear.js
// Command to delete a specified number of messages.

const { PermissionsBitField, ChannelType } = require('discord.js');
const { ACCENT_COLOR } = require('../config.js');

module.exports = {
    name: 'clear',
    description: 'Deletes a specified number of messages from the channel (up to 99).',
    async execute(message, args) {
        // Check if the user has the MANAGE_MESSAGES permission
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply({ content: '❌ You do not have permission to use this command. You need the `Manage Messages` permission.', ephemeral: true });
        }

        // Ensure the command is not used in a DM channel
        if (message.channel.type === ChannelType.DM) {
            return message.reply({ content: '❌ I cannot delete messages in Direct Messages.', ephemeral: true });
        }

        const amount = parseInt(args[0]);

        // Check if a valid number is provided
        if (isNaN(amount) || amount <= 0 || amount > 99) {
            return message.reply({ content: '🔢 Please provide a number between 1 and 99 for messages to delete.', ephemeral: true });
        }

        try {
            // Use bulkDelete directly with the amount. Discord.js will handle fetching.
            // Add 1 to amount to also delete the command message itself.
            const deletedMessages = await message.channel.bulkDelete(amount + 1, true); // 'true' allows partial messages to be deleted

            // Send a confirmation message, then delete it after a few seconds
            // Subtract 1 from deletedMessages.size because the command message itself was deleted.
            const replyMessage = await message.channel.send({ content: `✅ Successfully deleted \`${deletedMessages.size - 1}\` messages.`, ephemeral: false });
            setTimeout(() => replyMessage.delete().catch(console.error), 5000); // Delete after 5 seconds

        } catch (error) {
            console.error('Error clearing messages:', error);
            // Provide a more specific error message if it's a known Discord API error
            if (error.code === 50034) { // Discord API error code for messages older than 14 days
                return message.reply({ content: '⚠️ Cannot delete messages older than 14 days using this command.', ephemeral: true });
            }
            message.reply({ content: '❌ There was an error trying to clear messages in this channel.', ephemeral: true });
        }
    },
};
