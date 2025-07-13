// commands/ping.js
// A simple command to test bot latency.

module.exports = {
    name: 'ping', // The name of the command (e.g., !ping)
    description: 'Replies with Pong! and the bot\'s latency.', // Description for help commands

    async execute(message, args) {
        // 'message.client.ws.ping' directly accesses the WebSocket ping, which is more accurate.
        await message.reply(`Pong! Latency: ${Math.round(message.client.ws.ping)}ms`);
    },
};
