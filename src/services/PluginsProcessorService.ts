import fs from "node:fs/promises";
import path from "node:path";
import { IPlugin } from "@BotTemplate/types/IPlugin";

export default class PluginsProcessorService {
	async init(): Promise<void> {
		bot.logger.log("PluginsProcessorService initialized");
		await this.register("./dist/plugins");
	}

	async register(directory: string): Promise<void> {
		const files = await fs.readdir(directory);
		for (const file of files) {
			const stat = await fs.stat(path.join(directory, file));
			if (stat.isDirectory()) {
				await this.register(path.join(directory, file));
			} else {
				await this.registerPlugin(directory, file);
			}
		}
		bot.logger.log(`PluginsProcessorService loaded ${bot.plugins.size} plugins\n${[...bot.plugins.values()].map(e => `${" ".repeat(24)}*  Plugin ${e.name}`).join("\n")}`);
	}

	async registerPlugin(directory: string, file: string): Promise<void> {
		const filePath = `@BotTemplate/plugins/${path.relative("./dist/plugins", path.join(directory, file))}`.replace(/\\/g, "/");
		const plugin = await import(filePath);
		const pluginInstance: IPlugin = new plugin.default();
		await pluginInstance.init();
		bot.plugins.set(pluginInstance.name, pluginInstance);
	}
}