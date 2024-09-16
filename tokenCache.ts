import { type MemoryCache, createCache, memoryStore } from "cache-manager";

export type Seconds = number;

const _caching: MemoryCache = createCache(memoryStore());
const tokenKey = "token";

/**
 * In memory cache manager for MS API auth token storage
 * TODO : to be discussed if we should use one of the framework Graphql Mesh / Yoga cache
 *
 *  Cache to store a single value : the MS API token
 */
export const TokenCache = {
    getToken(): Promise<string | undefined> {
        return _caching.get(tokenKey);
    },

    async setToken(value: string, ttl: Seconds): Promise<string> {
        await _caching.set(tokenKey, value, ttl * 1000);
        return value;
    },
};
