import Redis from "ioredis";

// Hosted Redis gives a single connection URL; local dev uses host and port.
const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL)
  : new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: process.env.REDIS_PORT || 6379,
    });

redis.on("connect", () => {
  console.log("Redis connected successfully!");
});

redis.on("error", (err) => {
  console.error("Redis connection error:", err);
});

export default redis;
