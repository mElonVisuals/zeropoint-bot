// This code would go into your actual application (e.g., your website's backend, a desktop app)
// NOT your Discord bot's code.

const rpc = require('discord-rpc');
const CLIENT_ID = '1393986208828489788'; // Replace with the Application ID from Discord Dev Portal

// Only needed if you want to handle specific Discord events from the RPC client
// const RPC = new rpc.Client({ transport: 'ipc' });

// Set a timeout to prevent the process from hanging if Discord is not running
const timeout = setTimeout(() => {
    console.log('Discord RPC connection timed out. Is Discord running?');
    process.exit(1); // Exit if no connection after a while
}, 10000); // 10 seconds

async function setActivity() {
    if (!CLIENT_ID) {
        console.error('CLIENT_ID is not set. Please set your Discord Application ID.');
        return;
    }

    try {
        console.log('Attempting to connect to Discord RPC...');
        await rpc.register(CLIENT_ID); // Registers your application with Discord
        const rpcClient = new rpc.Client({ transport: 'ipc' });

        rpcClient.on('ready', () => {
            clearTimeout(timeout); // Clear the timeout if connection is successful
            console.log('Discord RPC connected!');

            // Set the Rich Presence activity
            rpcClient.setActivity({
                details: 'Crafting Cinematic Masterpieces', // Main text under the application name
                state: 'Exploring Visual Storytelling',    // Smaller text under details
                startTimestamp: new Date(),                // Shows elapsed time
                largeImageKey: 'zeropoint_logo',           // Name of the asset you uploaded in Dev Portal
                largeImageText: 'ZeroPoint Official',      // Text when hovering over the large image
                smallImageKey: 'zeropoint_logo',                  // Optional: if you have a small icon
                smallImageText: 'Powered by ZeroPoint',    // Text when hovering over the small image
                buttons: [
                    { label: 'Visit Website', url: 'https://zeropoint.melonvisuals.me/' }, // Replace with your actual website URL
                    { label: 'Join Discord', url: 'https://discord.com/invite/w9QUjyHr3U' } // Replace with your Discord invite
                ],
                instance: false, // Set to true if this is a game instance
            });

            console.log('Discord Rich Presence set successfully!');
        });

        // Handle RPC errors
        rpcClient.on('error', (err) => {
            console.error('Discord RPC Error:', err);
        });

        // Attempt to log in to Discord RPC
        await rpcClient.login({ clientId: CLIENT_ID });

    } catch (error) {
        console.error('Failed to set Discord Rich Presence:', error);
        clearTimeout(timeout); // Clear timeout on error
    }
}

// Call the function to set the activity when your application starts
setActivity();

// You might also want to clear the activity when your application closes
process.on('exit', () => {
    if (rpcClient && rpcClient.isConnected) {
        rpcClient.destroy();
        console.log('Discord RPC disconnected.');
    }
});
