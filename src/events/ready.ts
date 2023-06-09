export default function (): void {
	bot.logger.log(`Bot loaded using ${bot.client.user?.tag || "???"} tag`);
}