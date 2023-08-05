import { CommandInteraction } from "discord.js";

export default function (interaction: CommandInteraction): void {
	bot.commandPreprocessor.preprocessCommand(interaction).then(() => null);
}