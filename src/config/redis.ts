import { createClient } from "redis";
import { env } from "./env";

let redisClient: any = null;

class MockRedisClient {
  private cache = new Map<string, string>();

  async connect() {
    console.log("Mock Redis client initialized successfully.");
  }
  async get(key: string): Promise<string | null> {
    return this.cache.get(key) || null;
  }
  async set(key: string, value: string, options?: { EX?: number }): Promise<string> {
    this.cache.set(key, value);
    if (options?.EX) {
      setTimeout(() => this.cache.delete(key), options.EX * 1000);
    }
    return "OK";
  }
  async del(key: string): Promise<number> {
    const deleted = this.cache.has(key);
    this.cache.delete(key);
    return deleted ? 1 : 0;
  }
  async keys(pattern: string): Promise<string[]> {
    const prefix = pattern.replace("*", "");
    return Array.from(this.cache.keys()).filter((key) => key.startsWith(prefix));
  }
}

export async function connectRedis() {
  try {
    const client = createClient({ url: env.REDIS_URL });
    client.on("error", (err: any) => {
      console.warn("Redis Client Error:", err.message);
    });
    await client.connect();
    console.log("Redis connected successfully.");
    redisClient = client;
  } catch (error) {
    console.warn("Failed to connect to Redis, falling back to In-Memory cache:", (error as Error).message);
    const mock = new MockRedisClient();
    await mock.connect();
    redisClient = mock;
  }
}

export function getRedisClient() {
  if (!redisClient) {
    const mock = new MockRedisClient();
    redisClient = mock;
  }
  return redisClient;
}
