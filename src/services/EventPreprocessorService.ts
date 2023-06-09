import fs from "node:fs/promises";
import { Bot } from "@BotTemplate/client/Client";

export default class EventPreprocessorService {
	constructor(private readonly bot: Bot) {}

	async init(): Promise<void> {
		bot.logger.log("EventPreprocessorService initialized");
		await this.loadEvents("./dist/events");
	}

	async loadEvents(path: string): Promise<void> {
		bot.logger.log(`EventPreprocessorService started to load with ${path} path and started loading events`);
		const files = await fs.readdir(path);
		for (const file of files) {
			const stat = await fs.stat(`${path}/${file}`);
			if (stat.isDirectory()) {
				await this.loadEvents(`${path}/${file}`);
			} else {
				const event = await import(`@BotTemplate/events/${file}`);
				this.bot.client.on(file.split(".")[0], event.default);
				bot.logger.log(`EventPreprocessorService Event ${file} loaded`);
			}
		}
	}
}