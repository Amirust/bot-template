import { ApplicationCommandOptionData } from "discord.js";

export interface CommandDeclaration {
	/**
	 * The name of the command
	 */
	name: string;
	/**
	 * The description of the command
	 */
	description: string;
	/**
	 * The options of the command
	 */
	options?: ApplicationCommandOptionData[];
}