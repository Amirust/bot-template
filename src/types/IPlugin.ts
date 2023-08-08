export interface IPlugin {
	name: string;
	registerAs?: string;
	init(): Promise<void>;
	unload(): Promise<void>;
	restart(): Promise<void>;
	postSetup?(): Promise<void>;
}