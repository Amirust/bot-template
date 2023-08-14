import fs from "node:fs/promises";
import { LogLevel, LogType } from "@BotTemplate/types/Logger";
import npath from "node:path";

export default class LoggerService {
	constructor(
		private logDirectory: string,
		private logLevel: LogLevel = LogLevel.DEFAULT
	) {
		this.appendLogFile(`\n====${new Date().toLocaleString("ru")}====\n`).then(() => {});
		this.log(`Logger initialized with params: Dir: ${logDirectory}, Level: ${logLevel}`, LogType.DEBUG);
	}

	public log(message: string, type: LogType = LogType.INFO): void {
		const formattedMessage = this.format(`${this.getLogLevelPrefix(type)} ${message}`);
		if (this.resolveLogLevel(this.logLevel, type)) console.log(formattedMessage);
		this.appendLogFile(formattedMessage).then(() => {});
	}

	private getLogLevelPrefix(type: LogType): string {
		switch (type) {
		case LogType.DEBUG:
			return "[\x1b[90mdebug\x1b[0m]";
		case LogType.INFO:
			return "[\x1b[36mi\x1b[0m]";
		case LogType.WARN:
			return "[\x1b[33m⚠️\x1b[0m]";
		case LogType.ERROR:
			return "[\x1b[31m❌\x1b[0m]";
		}
	}
	private format(message: string): string {
		return `[${new Date().toLocaleString("ru")}] ${message}`;
	}

	private async appendLogFile(message: string): Promise<void> {
		const fileName = `${new Date().toLocaleDateString("ru").replace(/\./g,"-")}.log`;
		const filePath = npath.resolve(`${this.logDirectory}/${fileName}`);
		const fileExists = await fs.stat(filePath).then(() => true).catch(() => false);
		if (!fileExists) await fs.writeFile(filePath, "");
		await fs.appendFile(filePath, message + "\n");
	}

	private resolveLogLevel(logLevel: LogLevel, logType: LogType): boolean {
		switch (logLevel) {
		case LogLevel.ALL:
			return true;
		case LogLevel.DEBUG:
			return logType === LogType.DEBUG;
		case LogLevel.INFO:
			return logType === LogType.INFO;
		case LogLevel.WARN:
			return logType === LogType.WARN;
		case LogLevel.ERROR:
			return logType === LogType.ERROR;
		case LogLevel.OFF:
			return false;
		case LogLevel.DEFAULT:
			return logType === LogType.INFO || logType === LogType.WARN || logType === LogType.ERROR;
		}
	}

	public debug(message: string) {
		this.log(message, LogType.DEBUG);
	}

	public warn(message: string) {
		this.log(message, LogType.WARN);
	}

	public error(message: string) {
		this.log(message, LogType.ERROR);
	}
}