import { CacheProviderType } from "@BotTemplate/types/CacheProvider";

export interface IConfig {
	token: string;
	db: string;
	dbName: string;
	cache: CacheProviderType;
	version: string;
	rootUsers: string[];
}