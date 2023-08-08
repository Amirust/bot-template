import { CacheProvider } from "@BotTemplate/types/CacheProvider";

export default class NativeCacheProvider implements CacheProvider {
	private cache: Map<string, { value: unknown, expires: number }>;
	private readonly expirationTime: number;

	constructor(expirationTime: number) {
		this.cache = new Map();
		this.expirationTime = expirationTime;

		bot.logger.log("NativeCacheProvider initialized");

		setInterval(() => {
			this.cache.forEach((value, key) => {
				if (value.expires < Date.now()) this.cache.delete(key);
			});
		} , 10_000);
	}

	async delete(key: string): Promise<void> {
		return this.cache.delete(key) ? undefined : Promise.reject(new Error("Key not found"));
	}

	async get<T>(key: string): Promise<T | null> {
		return this.cache.get(key)?.value as T ?? null;
	}

	set<T>(key: string, value: T): Promise<void> {
		this.cache.set(key, { value, expires: Date.now() + this.expirationTime });
		return Promise.resolve();
	}

	clear(): Promise<void> {
		this.cache.clear();
		return Promise.resolve();
	}

	findByOwnProperties<T>(properties: { [key: string]: string }): T[] {
		const result: T[] = [];
		for (const value of this.cache.values()) {
			const isMatch = Object.entries(properties).every(([key, value]) => value === (value as any)[key]);
			if (isMatch) result.push(value.value as T);
		}
		return result;
	};

	deleteByOwnProperties(properties: { [key: string]: string }): void {
		for (const [key] of this.cache.entries()) {
			const isMatch = Object.entries(properties).every(([key, value]) => value === (value as any)[key]);
			if (isMatch) this.cache.delete(key);
		}
	}
}