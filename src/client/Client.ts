import { Client, IntentsBitField, Partials } from "discord.js";
import ConfigService from "@BotTemplate/config/ConfigService";
import I18nService from "@BotTemplate/locale/I18nService";
import LoggerService from "@BotTemplate/logger/LoggerService";
import EventPreprocessorService from "@BotTemplate/services/EventPreprocessorService";
import CommandsPreprocessorService from "@BotTemplate/services/CommandsPreprocessorService";
import CommandsDeclaratorService from "@BotTemplate/services/CommandsDeclaratorService";
import { IPlugin } from "@BotTemplate/types/IPlugin";
import PluginsProcessorService from "@BotTemplate/services/PluginsProcessorService";
import { EntityMetadata, MongoRepository } from "typeorm";

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
	public store: Map<string, MongoRepository<EntityMetadata>> = new Map();

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

		await (new PluginsProcessorService().init());
		await (new EventPreprocessorService(this)).init();
		await this.commandPreprocessor.init();
		await this.i18n.init();
		await this.client.login(this.config.get<string>("token")).catch(e => this.logger.error(e));
		await this.commandsDeclarator.init("./dist/commands");
	}
}