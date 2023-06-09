import { Colors, EmbedBuilder, Guild, Message, PermissionsBitField, TextChannel } from "discord.js";
import { inspect } from "node:util";

interface EvaledObject {
	readonly ok: boolean;
	readonly text: string;
}

export default async function (message: Message): Promise<void> {
	if (!bot.config.get<string[]>("rootUsers").includes(message.author.id)) return;
	if (!message.content.startsWith("??eval")) return;

	const before = process.hrtime.bigint();

	let code = message.content.slice(7).replace(/(```(.+)?)?/g, "");
	if (code.includes("await")) code = `(async () => {${code}})()`;
	const obj = await new Promise<EvaledObject>(async resolve => {
		try {
			const evaled = await eval(code);
			if ((message.channel as TextChannel).permissionsFor((message.guild as Guild).members.me!!)?.has(PermissionsBitField.Flags.ReadMessageHistory | PermissionsBitField.Flags.AddReactions))
				await message.react("✅");

			if (evaled === undefined) return;

			let text = inspect(evaled, { depth: 0, maxArrayLength: 50 });
			if (text.length > 1990) text = "Ответ занимает больше чем позволенно дискордом";
			resolve({ ok: true, text });
		} catch (err: any) {
			if ((message.channel as TextChannel).permissionsFor((message.guild as Guild).members.me!!)?.has(PermissionsBitField.Flags.ReadMessageHistory | PermissionsBitField.Flags.AddReactions))
				await message.react("❌");
			resolve({ ok: false, text: err.toString() });
		}
	});

	const after = process.hrtime.bigint();

	const embed = new EmbedBuilder()
		.setDescription(`\`\`\`js\n${obj.text}\`\`\``)
		.setColor(obj.ok ? Colors.Green : Colors.Red)
		.setFooter({ text: `Выполнено за ${after - before} наносекунд / ${(after - before) / BigInt(1e6)} мс` });

	await message.reply({ embeds: [embed] });
}