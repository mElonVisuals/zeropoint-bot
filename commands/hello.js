// commands/hello.js
// A simple greeting command.

module.exports = {
    name: 'hello',
    description: 'Greets the user.',

    async execute(message, args) {
        // Use message.member.displayName for the user's display name in the guild,
        // or message.author.username for their global Discord username.
        // message.member is only available if GuildMembers intent is enabled.
        const userName = message.member ? message.member.displayName : message.author.username;
        await message.reply(`Hello there, ${userName}! Welcome to ZeroPoint.`);
    },
};
