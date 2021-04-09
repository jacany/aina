import { Command } from "discord-akairo";
import { Message, MessageEmbed, Collection } from "discord.js";

import Error from "../../utils/error";

const args = [
	{
		id: "count",
		type: "number",
	},
	{
		id: "user",
		type: "member",
	},
];

export default class PurgeCommand extends Command {
	protected args = args;
	protected modOnly = true;

	constructor() {
		super("purge", {
			aliases: ["purge"],
			category: "Moderation",
			description: "Deletes user messages",
			clientPermissions: ["MANAGE_MESSAGES"],
			channel: "guild",
			args: args,
		});
	}

	// @ts-ignore stupid issue over types and shit
	userPermissions(message: Message) {
		const modRole = this.client.settings.get(
			message.guild!.id,
			"modRole",
			null
		);
		if (
			modRole &&
			!message.member!.roles.cache.some((role) => role.id === modRole)
		) {
			return "roleId: " + modRole;
		} else if (!modRole) {
			return message.channel.send(
				Error(
					message,
					this,
					"Invalid Configuration",
					"To use mod commands, you must first set a mod role. See the configuration section in help for more info."
				)
			);
		}

		return null;
	}

	async exec(message: Message, args: any): Promise<any> {
		const victim = args.user;
		const count = args.count;

		if (!count)
			return message.channel.send(
				Error(
					message,
					this,
					"Invalid Argument",
					"You must provide how many messages to delete!"
				)
			);
		if (count > 100)
			return message.channel.send(
				Error(
					message,
					this,
					"Invalid Argument",
					"You cannot purge more than 100 message at once!"
				)
			);
		try {
			let deleted: Collection<string, Message>;
			await message.channel.messages
				.fetch({ limit: count + 1 })
				.then((messages) => {
					// Fetches the messages
					if (victim) {
						deleted = messages.filter(
							(m) => m.author.id === victim.id || m.id === message.id
						);
					} else {
						deleted = messages;
					}
					if (!deleted.find((sus) => sus.id === message.id))
						return message.channel.send(
							Error(
								message,
								this,
								"Invalid Argument",
								"I could not find that user!"
							)
						);
					// @ts-ignore
					message.channel.bulkDelete(
						deleted // Bulk deletes all messages that have been fetched and are not older than 14 days (due to the Discord API)
					);
				});
			const logchannel = this.client.settings.get(
				message.guild!.id,
				"loggingChannel",
				"None"
			);
			if (logchannel === "None") return;
			let purgeEmbed = new MessageEmbed({
				title: "Purge",
				color: 16716032,
				timestamp: new Date(),
				author: {
					name: message.author.tag + " (" + message.author.id + ")",
					icon_url: message.author.avatarURL({ dynamic: true }) || "",
				},
				footer: {
					text: `No content ("") means that there was probably an embed there\nGreen represents the command that initated the purge\n${message.client.user?.tag}`,
					icon_url: message.client.user?.avatarURL({ dynamic: true }) || "",
				},
				fields: [
					{
						name: "Channel",
						value: `<#${message.channel.id}>`,
						inline: true,
					},
					{
						name: "Number of Messages",
						// @ts-ignore
						value: "`" + deleted.size + "`",
						inline: true,
					},
				],
			});
			let content: any = "```diff\n";
			// @ts-ignore
			for (const [key, value] of deleted) {
				if (key === message.id)
					content =
						content +
						`+ ${value.author.tag} (${value.author.id}): "${value.content}"\n`;
				else
					content =
						content +
						`- ${value.author.tag} (${value.author.id}): "${value.content}"\n`;
			}
			content = content + "```";
			purgeEmbed.setDescription(content);

			// @ts-ignore
			this.client.channels.cache
				.get(logchannel)
				// @ts-ignore
				.send(purgeEmbed);
		} catch (error) {
			console.error(error);
			return message.channel.send(
				Error(message, this, "An error occurred", error.message)
			);
		}
	}
}