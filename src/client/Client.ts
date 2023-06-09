import { Client, IntentsBitField, Partials } from "discord.js";
import ConfigService from "@BotTemplate/config/ConfigService.js";
import I18nService from "@BotTemplate/locale/I18nService.js";
import LoggerService from "@BotTemplate/logger/LoggerService.js";
import EventPreprocessorService from "@BotTemplate/services/EventPreprocessorService.js";
import CommandsPreprocessorService from "@BotTemplate/services/CommandsPreprocessorService.js";

const intents = new IntentsBitField();
Object.values(IntentsBitField.Flags).map((e: any) => intents.add(e));

export class Bot {
	public client: Client;
	public config: ConfigService;
	public i18n: I18nService = new I18nService();
	public logger: LoggerService;
	public commandPreprocessor!: CommandsPreprocessorService;

	constructor() {
		this.client = new Client({
			intents,
			partials: [Partials.User, Partials.Channel, Partials.Reaction]
		});

		this.logger = new LoggerService("./logs");
	}

	public async start() {
		this.commandPreprocessor = new CommandsPreprocessorService();
		this.config = await ConfigService.init("../../config.json");

		await (new EventPreprocessorService(this)).init();
		await this.commandPreprocessor.init();
		await this.i18n.init();
		await this.client.login(this.config.get<string>("token"));
	}
}