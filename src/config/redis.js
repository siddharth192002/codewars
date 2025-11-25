const {createClient} = require('redis');

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'redis-16849.crce179.ap-south-1-1.ec2.redns.redis-cloud.com',
        port: 16849
    }
});

module.exports=redisClient;