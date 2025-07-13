// commands/hello.js
// A simple greeting command.

module.exports = {
    name: 'hello',
    description: 'Greets the user.',

    async execute(message, args) {
        await message.reply(`Hello there, ${message.author.display_name}!`);
    },
};
