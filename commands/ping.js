// commands/ping.js
// A simple command to test bot latency.

module.exports = {
    name: 'ping', // The name of the command (e.g., !ping)
    description: 'Replies with Pong! and the bot\'s latency.', // Description for help commands

    async execute(message, args) {
        // 'message' is the Discord.js Message object
        // 'args' are any arguments passed after the command (e.g., for !ping <arg>)
        await message.reply(`Pong! Latency: ${Math.round(message.client.ws.ping)}ms`);
    },
};
