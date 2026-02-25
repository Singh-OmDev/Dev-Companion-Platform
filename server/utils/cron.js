const cron = require('node-cron');
const User = require('../models/User');
const Notification = require('../models/Notification');

const initCronJobs = () => {
    console.log('⏳ Initializing Cron Jobs...');

    // 1. Daily Streak Check (Runs every day at midnight)
    // For demo purposes, running every minute: '0 0 * * *' would be daily
    cron.schedule('0 0 * * *', async () => {
        console.log('Running Daily Streak Check...');
        try {
            const users = await User.find({});
            const today = new Date();

            for (const user of users) {
                // Logic: If last active date was yesterday, streak continues. 
                // If before yesterday, streak resets.
                // For now, just sending a motivational reminder to everyone.

                await Notification.create({
                    userId: user._id,
                    type: 'info',
                    message: "🌅 It's a new day! Keep your coding streak alive. Check in now!",
                    link: '/dashboard'
                });
            }
        } catch (err) {
            console.error('Cron Error:', err);
        }
    });


    

    // 2. Weekly Review Reminder (Every Sunday at 9 AM)
    cron.schedule('0 9 * * 0', async () => {
        try {
            const users = await User.find({});
            for (const user of users) {
                await Notification.create({
                    userId: user._id,
                    type: 'success',
                    message: "Weekly Review time! check your Insights to see how you performed.",
                    link: '/insights'
                });
            }
        } catch (err) {
            console.error('Cron Error:', err);
        }
    });
};

module.exports = initCronJobs;
