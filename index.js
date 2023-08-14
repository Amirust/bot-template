require("module-alias/register");

const { Bot } = require("./dist/client/Client.js");

(async () => {
	global.bot = new Bot();

	process.on("unhandledRejection", console.error);
	process.on("uncaughtException", console.error);

	await bot.start();
})();