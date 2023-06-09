import { GuildMember, PermissionsString } from "discord.js";

export class PermissionsResolverService {
	static resolvePermissions(permissions: string[], member: GuildMember): void {
		if (member.permissions.has("Administrator") || member.guild.ownerId === member.id) return;
		permissions.every(permission => {
			if (!member.permissions.has(<PermissionsString>permission)) throw new Error(`Missing permission: ${permission}`);
			return true;
		});
	}

	static getRequiredPermissionsName(permissions: string[], member: GuildMember): string[] {
		const memberPermissions = member.permissions.toArray();
		return permissions.filter(permission => !memberPermissions.includes(<PermissionsString>permission));
	}
}