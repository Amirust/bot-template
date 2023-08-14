import i18next from "i18next";
import fs from "node:fs/promises";

export default class I18nService {
	public i18n = i18next.init({
		fallbackLng: "ru",
		lng: "ru",
		resources: {},
		interpolation: {
			prefix: "{",
			suffix: "}"
		}
	});

	constructor() {}

	async init() {
		const files = await fs.readdir("./dist/locale/locales");
		for (const file of files) {
			const locale = file.split(".")[0];
			const resource = (await import(`@BotTemplate/locale/locales/${file}`));
			i18next.addResourceBundle(locale, "translation", resource.default);
		}

		bot.logger.log(`I18nService initialized with ${files.length} locales`);
		return this;
	}

	async translate(lng: string, key: string, args?: { [key: string]: string }) {
		if (i18next.language !== lng) await i18next.changeLanguage(lng);
		return i18next.t(key, args ?? {});
	}
}