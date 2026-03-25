const { createClient } = require('redis');

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT, 10)
    }
});

redisClient.on('error', (err) => console.error('Redis client error:', err));
redisClient.on('connect', () => console.log('Redis connected successfully'));

// .connect() is called in index.js via InitializeConnection()
module.exports = redisClient;