export class LocaleResolver {
	constructor(public readonly locale: string, public keyPrefix?: string) {}

	static resolveWithLocale(locale: string, key: string, answers?: { [key: string]: string }): string {
		return  bot.i18n.translate(locale, key, { answers });
	}

	public resolve(key: string, answers?: { [key: string]: string }): string {
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