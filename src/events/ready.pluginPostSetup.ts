export default function (): void {
	for (let plugin of bot.plugins.values())
		if (plugin.postSetup) plugin.postSetup().then(() => null);
}