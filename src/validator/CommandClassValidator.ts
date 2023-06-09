export class CommandClassValidator {
	static validate(command: any): boolean {
		return "name" in command && "execute" in command && typeof command.name === "string" && typeof command.execute === "function";
	}
}