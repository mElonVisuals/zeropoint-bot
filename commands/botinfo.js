// commands/botinfo.js
// Provides detailed information about the bot.

const { EmbedBuilder } = require('discord.js');
const { ACCENT_COLOR, ZEROPOINT_LOGO_URL } = require('../config.js');
const os = require('os'); // Node.js built-in module for OS info

module.exports = {
    name: 'botinfo',
    description: '📊 Displays detailed information about the bot.',
    async execute(message, args) {
        const client = message.client; // The Discord client instance

        // Calculate uptime
        let totalSeconds = (client.uptime / 1000);
        let days = Math.floor(totalSeconds / 86400);
        totalSeconds %= 86400;
        let hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = Math.floor(totalSeconds % 60);
        const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

        // Calculate total members across all guilds (requires GuildMembers intent)
        const totalMembers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);

        // Get memory usage (Node.js process)
        const usedMemory = process.memoryUsage().heapUsed / 1024 / 1024; // in MB

        const embed = new EmbedBuilder()
            .setTitle(`🤖 ZeroPoint Bot Information`)
            .setColor(ACCENT_COLOR)
            .setThumbnail(ZEROPOINT_LOGO_URL)
            .addFields(
                { name: 'Bot Name', value: client.user.tag, inline: true },
                { name: 'Bot ID', value: client.user.id, inline: true },
                { name: 'Uptime', value: `\`${uptimeString}\``, inline: true },
                { name: 'Servers', value: client.guilds.cache.size.toString(), inline: true },
                { name: 'Total Members', value: totalMembers.toString(), inline: true },
                { name: 'WebSocket Latency', value: `\`${Math.round(client.ws.ping)}ms\``, inline: true },
                { name: 'Discord.js Version', value: `v${require('discord.js').version}`, inline: true },
                { name: 'Node.js Version', value: process.version, inline: true },
                { name: 'Memory Usage', value: `\`${usedMemory.toFixed(2)} MB\``, inline: true },
                { name: 'Platform', value: os.platform(), inline: true }
            )
            .setFooter({ text: 'ZeroPoint | Bot Status' })
            .setTimestamp();

        await message.channel.send({ embeds: [embed] });
    },
};
