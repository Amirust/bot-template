import { CommandDeclaration } from "@BotTemplate/types/CommandDeclaration";

export interface CommandCategoryDeclaration {
	/**
	 * The name of the command category or the command itself
	 */
	category: string;
	commands: CommandDeclaration[]
}