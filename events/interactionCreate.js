// events/interactionCreate.js
// This event handles all interactions (slash commands, buttons, select menus, context menus).
// It's a crucial event for future bot expansion.

module.exports = {
    name: 'interactionCreate',
    async execute(client, interaction) {
        // Log the interaction type for debugging/monitoring
        console.log(`Interaction received: ${interaction.type} by ${interaction.user.tag}`);

        // You can add logic here to handle different types of interactions
        // For example, if you implement slash commands later:
        // if (interaction.isCommand()) {
        //     const command = client.commands.get(interaction.commandName);
        //     if (!command) return;
        //     try {
        //         await command.execute(interaction);
        //     } catch (error) {
        //         console.error(error);
        //         await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        //     }
        // }
        // Add more conditions for buttons, select menus, etc. as you expand.
    },
};
