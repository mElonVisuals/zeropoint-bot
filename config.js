// config.js
// This file holds configuration constants for your bot.

// --- Bot Settings ---
module.exports.PREFIX = '.'; // The prefix for your bot's commands (e.g., !ping)

// --- Channel IDs ---
// To get a channel ID: Enable Developer Mode in Discord (User Settings -> Advanced),
// then right-click on a channel and select "Copy ID".
module.exports.WELCOME_CHANNEL_ID = '1365071343414018078'; // Replace with your actual Welcome channel ID
module.exports.RULES_CHANNEL_ID = '1364678092362223716'; // Replace with your actual Rules channel ID
module.exports.FAREWELL_CHANNEL_ID = '1393972301485314138'; // NEW: Channel for farewell messages
module.exports.LOG_CHANNEL_ID = '1369865705238954168'; // NEW: Channel for bot logs (e.g., deleted messages)
module.exports.INTRODUCTIONS_CHANNEL_ID = '1393953737197879396'; // Replace with your actual Introductions channel ID
module.exports.COMMISSION_INFO_CHANNEL_ID = '1393741240922542192'; // Replace with your actual Commission Info channel ID

// --- Ticket System Settings ---
module.exports.TICKET_CATEGORY_ID = '1365071340591124500'; // NEW: ID of the category where new tickets will be created
module.exports.TICKET_LOG_CHANNEL_ID = '1369865688130392145'; // NEW: Channel where ticket creation/closure will be logged
module.exports.STAFF_ROLE_ID = '1365071265680982056'; // NEW: ID of the role that should have access to all tickets (e.g., 'Moderator', 'Admin')

// --- Verification System Settings (NEW) ---
module.exports.VERIFICATION_CHANNEL_ID = '1369863763611746477'; // The channel where users will verify
module.exports.UNVERIFIED_ROLE_ID = '1369861485479596134'; // Role assigned to new members before verification
module.exports.VERIFIED_ROLE_ID = '1365071277064323324'; // Role assigned after successful verification (can be your main member role)

// --- External URLs ---
module.exports.YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@melon.visuals"; // Replace with your YouTube URL
module.exports.WEBSITE_URL = "https://zeropoint.melonvisuals.me/"; // Replace with your website URL
module.exports.ZEROPOINT_LOGO_URL = "https://melonvisuals.me/test/zeropoint.png"; // Your ZeroPoint logo URL

// --- Colors ---
// Define your bot's accent color in hexadecimal format (e.g., 0x2cb4e9 for #2cb4e9)
module.exports.ACCENT_COLOR = 0x2cb4e9;
