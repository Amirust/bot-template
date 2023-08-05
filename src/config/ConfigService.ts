import { IConfig } from "@BotTemplate/types/IConfig";

export default class ConfigService {
	constructor(public config: IConfig) {}

	static async init(path: string): Promise<ConfigService> {
		const config = (await import(path, { assert: { type: "json" } })).default;
		return new ConfigService(config);
	}

	public get<T>(key: keyof IConfig): T {
		const value = this.config[key];
		if (Array.isArray(value)) return value as T;
		else if (value.startsWith("env")) {
			const envValue = process.env[
				value.split("-")[1] != undefined
					? value.split("-")[1]
					: key
			];
			if (!envValue) throw new Error(`Environment variable ${key} not found`);
			return envValue.replaceAll("\"", "") as T;
		} else {
			if (!value) throw new Error(`Config key ${key} not found`);
			return value as T;
		}
	}
}