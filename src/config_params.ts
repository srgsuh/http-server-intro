import config from "config";

export function getConfigValue<T>(key: string, defaultValue: T): T {
    return config.has(key)? config.get<T>(key) : defaultValue;
}