import { Client, IntentsBitField, Partials } from "discord.js";
import ConfigService from "@BotTemplate/config/ConfigService.js";
import I18nService from "@BotTemplate/locale/I18nService.js";
import LoggerService from "@BotTemplate/logger/LoggerService.js";
import EventPreprocessorService from "@BotTemplate/services/EventPreprocessorService.js";
import CommandsPreprocessorService from "@BotTemplate/services/CommandsPreprocessorService.js";
import { CommandsDeclaratorService } from "@BotTemplate/services/CommandsDeclaratorService.js";
import { IPlugin } from "@BotTemplate/types/IPlugin";
import NativeCacheProvider from "@BotTemplate/cache/NativeCacheProvider.js";
import MongoDBPlugin, { Collection } from "@BotTemplate/plugins/MongoDB.plugin.js";

const intents = new IntentsBitField();
Object.values(IntentsBitField.Flags).map((e: any) => intents.add(e));

export class Bot {
	public client: Client;
	public config: ConfigService;
	public i18n: I18nService = new I18nService();
	public logger: LoggerService;
	public commandPreprocessor!: CommandsPreprocessorService;
	public commandsDeclarator!: CommandsDeclaratorService;
	public plugins: Map<string, IPlugin> = new Map();
	public cache: NativeCacheProvider;
	public store: Map<string, Collection> = new Map();

	constructor() {
		this.client = new Client({
			intents,
			partials: [Partials.User, Partials.Channel, Partials.Reaction]
		});

		this.logger = new LoggerService("./logs");
	}

	public async start() {
		this.commandPreprocessor = new CommandsPreprocessorService();
		this.commandsDeclarator = new CommandsDeclaratorService();
		this.config = await ConfigService.init("../../config.json");
		const mongo = new MongoDBPlugin();

		await (new EventPreprocessorService(this)).init();
		await this.commandPreprocessor.init();
		await this.commandsDeclarator.init("./dist/commands");
		await this.i18n.init();
		this.cache = new NativeCacheProvider(120_000);
		await mongo.init();
		await this.client.login(this.config.get<string>("token"));

		await mongo.postSetup();
	}
}