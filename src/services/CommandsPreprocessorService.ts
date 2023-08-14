import { ChatInputCommandInteraction, Collection, CommandInteraction, GuildMember } from "discord.js";
import { Command } from "@BotTemplate/types/Command";
import fs from "node:fs/promises";
import path from "node:path";
import { CommandClassValidator } from "@BotTemplate/validator/CommandClassValidator";
import { LocaleResolver } from "@BotTemplate/locale/LocaleResolver";
import { PermissionsResolverService } from "@BotTemplate/permissions/PermissionsResolverService";
import { LogType } from "@BotTemplate/types/Logger";

class CommandsLoaderService {
	public static commands: Collection<string, Command> = new Collection();

	public static async init(path: string): Promise<Collection<string, Command>> {
		bot.logger.log(`CommandsLoaderService initialized with ${path} path and started loading commands`);
		await this.register(path);
		bot.logger.log(`CommandsLoaderService loaded ${this.commands.size} commands\n${this.commands.map(e => `${" ".repeat(24)}*  Command ${e.name}`).join("\n")}`);
		return this.commands;
	}

	private static async register(directory: string) {
		const files = await fs.readdir(directory);
		for (const file of files) {
			const stat = await fs.stat(path.join(directory, file));
			if (stat.isDirectory()) {
				await this.register(path.join(directory, file));
			} else {
				if (file.startsWith("declaration")) continue;
				const filePath = `@BotTemplate/commands/${path.relative("./dist/commands", path.join(directory, file))}`.replace(/\\/g, "/");
				await this.registerCommand(filePath);
			}
		}
	}

	private static async registerCommand(filePath: string) {
		const fileInstance = (await import(filePath)).default;
		const command = new fileInstance() as Command;
		if (!CommandClassValidator.validate(command)) {
			bot.logger.error(`CommandsLoaderService Command ${command.name} is not valid`);
			return;
		}
		this.commands.set(command.name, command);
		return command;
	}
}

export default class CommandsPreprocessorService {
	public commands: Collection<string, Command> = new Collection();

	async init(): Promise<void> {
		this.commands = await CommandsLoaderService.init("./dist/commands");
		bot.logger.log("CommandsPreprocessorService initialized");
	}

	getCommand(name: string): Command | undefined {
		return this.commands.get(name);
	}

	getSubCommand(name: string, category: string): Command | undefined {
		return this.commands.find(e => e.name === name && e.parentOf === category);
	}

	async preprocessCommand(interaction: CommandInteraction) {
		const command = this.getCommand(interaction.commandName);
		if (!command)
			return bot.logger.log(`CommandsPreprocessorService Command ${interaction.commandName} not found`, LogType.ERROR);

		const locale = new LocaleResolver(interaction.locale);

		if (command.guildOnly && !interaction.guild)
			return interaction.reply({
				content: await locale.resolve("error.guildOnly"),
				ephemeral: true
			});

		if (command.permissions || command.botPermissions) {
			let userPermsPassed = false;
			let botPermsPassed = false;
			try {
				if (command.permissions) PermissionsResolverService.resolvePermissions(command.permissions, interaction.member as GuildMember); userPermsPassed = true;
				if (command.botPermissions) PermissionsResolverService.resolvePermissions(command.botPermissions, interaction.guild?.members.me as GuildMember); botPermsPassed = true;
			} catch (e: any) {
				return interaction.reply({
					content: await locale.resolve(botPermsPassed ? userPermsPassed ? "" : "error.permissions" : "error.botPermissions", {
						permissions: (await Promise.all(PermissionsResolverService.getRequiredPermissionsName((botPermsPassed ? userPermsPassed ? [] : command.permissions : command.botPermissions) ?? [], (botPermsPassed ? userPermsPassed ? [] : interaction.member : interaction.guild?.members.me) as GuildMember)
							.map(e => locale.resolve(`permissions.${e}`))))
							.map(e => `\`${e}\``)
							.join(", ")
					}),
					ephemeral: true
				});
			}
		}

		try {
			if (interaction.isAutocomplete())
				return command.executeAutoComplete?.(interaction, locale.setPrefix(`commands.${command.name}`));

			if (interaction.isContextMenuCommand())
				return command.execute(interaction, locale.setPrefix(`commands.${command.name}`));

			if (interaction.isChatInputCommand()) {
				if ((interaction as ChatInputCommandInteraction).options.getSubcommand(false) !== null) {
					const subCommand = this.getSubCommand(interaction.commandName, (interaction as ChatInputCommandInteraction).options.getSubcommand());
					if (subCommand) return subCommand.execute(interaction, locale.setPrefix(`commands.${command.name}`));
				} else {
					return command.execute(interaction, locale.setPrefix(`commands.${command.name}`));
				}
			}
		}
		catch (e: any) {
			return interaction.reply({
				content: await locale.resolve("error.unknown", { stack: e.stack }),
				ephemeral: true
			});
		}
	}
}