enum CacheProviderType {
	Native = "native",
	Redis = "redis://"
}

namespace CacheProviderType {
	export function parse(type: string): CacheProviderType {
		if (type === "native") return CacheProviderType.Native;
		if (type.startsWith("redis://")) return CacheProviderType.Redis;
		throw new Error(`Unknown cache provider type: ${type}`);
	}
}

interface CacheProvider {
	get<T>(key: string): Promise<T | null>;
	set<T>(key: string, value: T): Promise<void>;
	delete(key: string): Promise<void>;
	clear(): Promise<void>;

	findByOwnProperties<T>(properties: { [key: string]: string }): T[];
	deleteByOwnProperties(properties: { [key: string]: string }): void;
}

export {
	CacheProviderType,
	CacheProvider
};