export class LocaleResolver {
	constructor(public readonly locale: string, public keyPrefix?: string) {}

	static resolveWithLocale(locale: string, key: string, answers?: string[]): string {
		const text = bot.i18n.translate(locale, key,);
		if (!answers) return text;
		return text.replace( /\{([0-9a-zA-Z_]+)\}/g, (_: any, item: number) => {
			return answers[item] ?? "";
		});
	}

	public resolve(key: string, answers?: string[]): string {
		return LocaleResolver.resolveWithLocale(this.locale,
			this.keyPrefix
				? `${this.keyPrefix}.${key}`
				: key,
			answers);
	}

	public setPrefix(prefix: string): LocaleResolver {
		this.keyPrefix = prefix;
		return this;
	}
}