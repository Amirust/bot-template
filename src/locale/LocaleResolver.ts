export class LocaleResolver {
	constructor(public readonly locale: string, public keyPrefix?: string) {}

	static async resolveWithLocale(locale: string, key: string, answers?: { [key: string]: string }): Promise<string> {
		return await bot.i18n.translate(locale, key, answers);
	}

	public async resolve(key: string, answers?: { [key: string]: string }): Promise<string> {
		return await LocaleResolver.resolveWithLocale(this.locale,
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