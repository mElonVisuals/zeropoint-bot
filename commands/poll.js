// commands/poll.js
// Creates a poll with reaction-based voting.

const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { ACCENT_COLOR } = require('../config.js');

// Emojis for poll options (up to 10 options)
const pollEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

module.exports = {
    name: 'poll',
    description: '📊 Creates a reaction-based poll. Usage: `!poll "Your Question" "Option 1" "Option 2" ...` (min 2, max 10 options)',
    async execute(message, args) {
        // Ensure the user has permission to manage messages (or a custom poll role)
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply({ content: '❌ You do not have permission to create polls. You need the `Manage Messages` permission.', ephemeral: true });
        }

        // Parse arguments: The first argument is the question, subsequent arguments are options.
        // Use a simple regex to split by quotes for now, assuming quoted arguments.
        const parsedArgs = message.content.match(/"[^"]+"|[^"\s]+/g)
                                .map(arg => arg.replace(/"/g, '').trim())
                                .filter(arg => arg.length > 0);

        // Remove the command name itself
        parsedArgs.shift(); // Removes '!poll' or whatever the prefix + command name was

        const question = parsedArgs.shift(); // First item after command is the question
        const options = parsedArgs; // Remaining items are options

        // Validate input
        if (!question) {
            return message.reply({ content: '❌ Please provide a question for the poll. Usage: `!poll "Your Question" "Option 1" "Option 2" ...`', ephemeral: true });
        }
        if (options.length < 2) {
            return message.reply({ content: '❌ Please provide at least two options for the poll. Usage: `!poll "Your Question" "Option 1" "Option 2" ...`', ephemeral: true });
        }
        if (options.length > pollEmojis.length) {
            return message.reply({ content: `❌ You can provide a maximum of ${pollEmojis.length} options for the poll.`, ephemeral: true });
        }

        const pollDescription = options.map((option, index) =>
            `${pollEmojis[index]} ${option}`
        ).join('\n\n'); // Add extra newline for better spacing between options

        const pollEmbed = new EmbedBuilder()
            .setTitle(`📊 Poll: ${question}`)
            .setDescription(pollDescription)
            .setColor(ACCENT_COLOR)
            .setFooter({ text: `Poll by ${message.author.tag}` })
            .setTimestamp();

        try {
            // Send the poll message
            const pollMessage = await message.channel.send({ embeds: [pollEmbed] });

            // Add reactions for each option
            for (let i = 0; i < options.length; i++) {
                await pollMessage.react(pollEmojis[i]);
            }

            // Delete the command message to keep the channel clean
            await message.delete().catch(e => console.error("Failed to delete poll command message:", e));

        } catch (error) {
            console.error('Error creating poll:', error);
            await message.reply({ content: '❌ There was an error creating the poll. Please check my permissions or try again later.', ephemeral: true });
        }
    },
};
