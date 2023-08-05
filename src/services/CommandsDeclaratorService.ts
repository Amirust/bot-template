import { ApplicationCommandDataResolvable, Collection } from "discord.js";
import fs from "node:fs/promises";
import path from "node:path";
import { CommandDeclaration } from "@BotTemplate/types/CommandDeclaration";
import { CommandCategoryDeclaration } from "@BotTemplate/types/CommandCategoryDeclaration";

export class CommandsDeclaratorService {
	public declarations: Collection<string, CommandDeclaration | CommandCategoryDeclaration> = new Collection();

	public async init(directory: string) {
		await this.register(directory);
	}

	private async register(directory: string) {
		const files = await fs.readdir(directory);
		for (const file of files) {
			const stat = await fs.stat(path.join(directory, file));
			if (stat.isDirectory()) {
				await this.register(path.join(directory, file));
			} else {
				await this.registerDeclaration(directory, file);
			}
		}
	}

	private async registerDeclaration(directory: string, file: string) {
		const filePath = `@BotTemplate/commands/${path.relative("./dist/commands", path.join(directory, file))}`.replace(/\\/g, "/");
		const fileInstance = await import(filePath);
		const isCommandDeclaration = path.basename(filePath).startsWith("declaration");
		const isCommandCategoryDeclaration = "category" in fileInstance;
		if (isCommandDeclaration) {
			this.declarations.set(isCommandCategoryDeclaration ? fileInstance.category : fileInstance.name, fileInstance);
			if (isCommandCategoryDeclaration) {
				const category = fileInstance as CommandCategoryDeclaration;
				const info = {
					name: category.category,
					options: category.commands.map((command: CommandDeclaration) => {
						return {
							name: command.name,
							description: command.description,
							type: 1,
							options: command.options
						};
					})
				} as ApplicationCommandDataResolvable;
				return bot.client.application?.commands.create(info);
			} else {
				const command = fileInstance as CommandDeclaration;
				return bot.client.application?.commands.create(command);
			}
		}
	}
}