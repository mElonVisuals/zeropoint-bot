// events/guildMemberAdd.js
// This event fires when a new member joins the guild.

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
const { WELCOME_CHANNEL_ID, FAREWELL_CHANNEL_ID, UNVERIFIED_ROLE_ID, VERIFIED_ROLE_ID, VERIFICATION_CHANNEL_ID, ACCENT_COLOR, ZEROPOINT_LOGO_URL } = require('../config.js');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        console.log(`[EVENT - guildMemberAdd] Member joined: ${member.user.tag} (${member.id})`);

        // --- Verification System Logic ---
        if (UNVERIFIED_ROLE_ID && VERIFIED_ROLE_ID && VERIFICATION_CHANNEL_ID) {
            try {
                const unverifiedRole = member.guild.roles.cache.get(UNVERIFIED_ROLE_ID);
                const verifiedRole = member.guild.roles.cache.get(VERIFIED_ROLE_ID);
                const verificationChannel = member.guild.channels.cache.get(VERIFICATION_CHANNEL_ID);

                if (!unverifiedRole) {
                    console.error(`[ERROR - Verification] UNVERIFIED_ROLE_ID (${UNVERIFIED_ROLE_ID}) not found.`);
                }
                if (!verifiedRole) {
                    console.error(`[ERROR - Verification] VERIFIED_ROLE_ID (${VERIFIED_ROLE_ID}) not found.`);
                }
                if (!verificationChannel) {
                    console.error(`[ERROR - Verification] VERIFICATION_CHANNEL_ID (${VERIFICATION_CHANNEL_ID}) not found.`);
                }

                if (unverifiedRole && verifiedRole && verificationChannel) {
                    // Assign the unverified role
                    await member.roles.add(unverifiedRole, 'New member joined, assigning unverified role for verification.');
                    console.log(`[Verification] Assigned unverified role to ${member.user.tag}.`);

                    // Fetch verification settings from a persistent store (e.g., dashboard config)
                    // For now, we'll use a placeholder or hardcoded default message/embed if not fetched from dashboard.
                    // In a real scenario, this would be fetched from your database/dashboard settings.
                    let verificationMessageContent = `Welcome ${member.toString()}! To gain access to the server, please click the "Verify" button below.`;
                    let verificationEmbedData = {
                        title: '✅ Server Verification',
                        description: 'Please click the button below to verify your account and gain full access to the server. This helps us keep our community safe!',
                        color: ACCENT_COLOR,
                        footer: { text: 'ZeroPoint | Verification' },
                        thumbnail: { url: ZEROPOINT_LOGO_URL },
                        timestamp: new Date().toISOString()
                    };

                    // In a full implementation, you'd fetch these from your dashboard's saved settings.
                    // Example (pseudo-code):
                    // const guildSettings = await getGuildSettings(member.guild.id);
                    // if (guildSettings && guildSettings.verification) {
                    //     verificationMessageContent = guildSettings.verification.message || verificationMessageContent;
                    //     verificationEmbedData = guildSettings.verification.embed || verificationEmbedData;
                    // }

                    const verifyButton = new ButtonBuilder()
                        .setCustomId('verify_button')
                        .setLabel('Verify')
                        .setStyle(ButtonStyle.Success)
                        .setEmoji('✔️');

                    const row = new ActionRowBuilder().addComponents(verifyButton);

                    await verificationChannel.send({
                        content: verificationMessageContent,
                        embeds: [new EmbedBuilder(verificationEmbedData)],
                        components: [row]
                    });
                    console.log(`[Verification] Sent verification message to ${verificationChannel.name} for ${member.user.tag}.`);
                } else {
                    console.warn(`[WARN - Verification] Missing one or more verification config IDs. Skipping verification for ${member.user.tag}.`);
                }
            } catch (error) {
                console.error(`[ERROR - Verification] Failed to assign unverified role or send verification message for ${member.user.tag}:`, error);
            }
        } else {
            console.log(`[INFO - guildMemberAdd] Verification system not fully configured. Skipping verification for ${member.user.tag}.`);
        }

        // --- Original Welcome Message Logic (Optional, can be removed if verification is strict) ---
        // You might want to remove or modify this if verification is mandatory and users only see the verification channel.
        const welcomeChannel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
        if (welcomeChannel && welcomeChannel.permissionsFor(member.guild.members.me).has(PermissionsBitField.Flags.SendMessages)) {
            const welcomeEmbed = new EmbedBuilder()
                .setTitle(`🎉 Welcome to ${member.guild.name}!`)
                .setDescription(`Hello ${member.toString()}, we're glad to have you here!`)
                .setColor(ACCENT_COLOR)
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: 'Rules', value: `<#${RULES_CHANNEL_ID}>`, inline: true },
                    { name: 'Introductions', value: `<#${INTRODUCTIONS_CHANNEL_ID}>`, inline: true }
                )
                .setFooter({ text: `Member #${member.guild.memberCount}` })
                .setTimestamp();

            await welcomeChannel.send({ embeds: [welcomeEmbed] }).catch(console.error);
            console.log(`[EVENT - guildMemberAdd] Sent welcome message to ${welcomeChannel.name} for ${member.user.tag}.`);
        } else {
            console.warn(`[WARN - guildMemberAdd] Welcome channel (${WELCOME_CHANNEL_ID}) not found or bot lacks permissions. Skipping welcome message.`);
        }
    },
};
