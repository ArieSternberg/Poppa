import cron from 'node-cron';
import fetch from 'node-fetch';

console.log('Starting notification test script...');

// Function to call the notifications endpoint
async function triggerNotifications() {
  try {
    console.log(`\n[${new Date().toLocaleTimeString()}] Checking for medications...`);
    
    const response = await fetch('http://localhost:3000/api/notifications');
    const data = await response.json();
    
    console.log('Response:', data);
  } catch (error) {
    console.error('Error triggering notifications:', error);
  }
}

// Option 1: Run immediately once
console.log('Running immediate test...');
await triggerNotifications();

// Option 2: Run every 15 minutes like the real cron
cron.schedule('*/15 * * * *', () => {
  console.log('\nScheduled test running...');
  triggerNotifications();
});

console.log('Script is running. Press Ctrl+C to stop.'); 