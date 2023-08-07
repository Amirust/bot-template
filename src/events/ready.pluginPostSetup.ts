export default function (): void {
	[...bot.plugins.values()].forEach(e => e.postSetup?.());
}