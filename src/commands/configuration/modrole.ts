import Command from "../../struct/Command";
import { Message, MessageEmbed } from "discord.js";

export default class ModroleCommand extends Command {
	constructor() {
		super("modrole", {
			aliases: ["modrole"],
			category: "Configuration",
			args: [
				{
					id: "role",
					type: "role",
				},
			],
			description:
				"Changes the Mod Role, setting this is required if you want to use Moderation commands.",

			userPermissions: ["MANAGE_GUILD"],
		});
	}

	async exec(message: Message, args: any): Promise<any> {
		const prefix = message.util?.parsed?.prefix;

		// The third param is the default.
		const currentRole = this.client.settings.get(
			message.guild!.id,
			"modRole",
			null
		);

		if (!args.role && currentRole) {
			return message.channel.send({
				embeds: [
					this.embed(
						{
							title: "Current Mod Role",
							fields: [
								{
									name: "Role",
									value: currentRole
										? `<@&${currentRole}>`
										: "None",
								},
							],
						},
						message
					),
				],
			});
		} else if (!args.role && !currentRole) {
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Configuration",
						"There is no mod role set, use the '" +
							prefix +
							"modrole' command to set it."
					),
				],
			});
		}

		await this.client.settings.set(
			message.guild!.id,
			"modRole",
			args.role.id
		);
		return message.channel.send({
			embeds: [
				this.embed(
					{
						title: `${this.client.emoji.greenCheck} Changed Mod Role`,
						fields: [
							{
								name: "Before",
								value: currentRole
									? `<@&${currentRole}>`
									: "None",
								inline: true,
							},
							{
								name: "After",
								value: args.role.toString(),
								inline: true,
							},
						],
					},
					message
				),
			],
		});
	}
}
