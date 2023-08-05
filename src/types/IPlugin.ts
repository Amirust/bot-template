export interface IPlugin {
	name: string;
	configRequired: boolean;
	init(): Promise<void>;
	unload(): Promise<void>;
	restart(): Promise<void>;
	postSetup?(): Promise<void>;
}