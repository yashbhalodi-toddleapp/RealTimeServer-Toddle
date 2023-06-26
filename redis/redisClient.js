const redis = require("redis");

const redisClient = redis.createClient({ url: process.env.REDIS_URI });

(async () => {
  await redisClient.connect();
})();

module.exports = redisClient;
