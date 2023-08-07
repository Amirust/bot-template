export interface IPlugin {
	name: string;
	init(): Promise<void>;
	unload(): Promise<void>;
	restart(): Promise<void>;
	postSetup?(): Promise<void>;
}