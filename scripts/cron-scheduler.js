#!/usr/bin/env node

const https = require('https');
const http = require('http');

const CRON_ENDPOINT = process.env.CRON_ENDPOINT || 'http://localhost:3000/api/cron';
const CRON_SECRET = process.env.CRON_SECRET;
const CRON_SCHEDULE = process.env.CRON_SCHEDULE || '* * * * *'; // Default: every minute

// Parse cron schedule (simple parser for minute-based schedules)
function parseCronSchedule(schedule) {
  const parts = schedule.trim().split(/\s+/);

  if (parts.length !== 5) {
    console.error('Invalid cron schedule format. Using default: every minute');
    return 60000; // 1 minute
  }

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  // For simplicity, only support minute-based schedules (e.g., "*/5 * * * *" or "* * * * *")
  if (minute === '*') {
    return 60000; // Every minute
  }

  if (minute.startsWith('*/')) {
    const interval = parseInt(minute.substring(2), 10);
    return interval * 60000;
  }

  // Default to 1 minute for other patterns
  console.warn('Complex cron schedules not fully supported. Using 1 minute interval.');
  return 60000;
}

function makeRequest(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers,
    };

    const req = protocol.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ statusCode: res.statusCode, body: data });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function triggerCron() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Triggering cron job: ${CRON_ENDPOINT}`);

  try {
    const headers = {};
    if (CRON_SECRET) {
      headers['Authorization'] = `Bearer ${CRON_SECRET}`;
    }

    const response = await makeRequest(CRON_ENDPOINT, headers);
    console.log(`[${timestamp}] ✅ Cron job completed successfully`);
    console.log(`Response: ${response.body}`);
  } catch (error) {
    console.error(`[${timestamp}] ❌ Cron job failed:`, error.message);
  }
}

function startCronScheduler() {
  const intervalMs = parseCronSchedule(CRON_SCHEDULE);

  console.log('🚀 Cron scheduler started');
  console.log(`📅 Schedule: ${CRON_SCHEDULE} (${intervalMs}ms interval)`);
  console.log(`🎯 Endpoint: ${CRON_ENDPOINT}`);
  console.log('');

  // Run immediately on start
  triggerCron();

  // Then run on interval
  setInterval(triggerCron, intervalMs);
}

// Handle shutdown signals
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  process.exit(0);
});

startCronScheduler();