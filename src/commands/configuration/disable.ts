import {
	Command,
	Category,
	Inhibitor,
	Listener,
	Argument,
} from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

import Error from "../../utils/error";

const arg = [
	{
		id: "todisable",
		type: Argument.union("commandAlias", "command", "string"),
	},
];

export default class DisableCommand extends Command {
	protected args = arg;

	constructor() {
		super("disable", {
			aliases: ["disable"],
			category: "Configuration",
			args: arg,
			description: "Disable commands on the bot",
			channel: "guild",
			userPermissions: ["ADMINISTRATOR"],
		});
	}

	async exec(message: Message, args: any): Promise<any> {
		let toDisable = args.todisable;

		let oldSettings = this.client.settings.get(
			message.guild!.id,
			"disabledCommands",
			null
		);

		if (typeof oldSettings === "string") oldSettings = JSON.parse(oldSettings);

		if (!toDisable) {
			const embed = new MessageEmbed({
				title: "Commands",
				color: 16716032,
				timestamp: new Date(),
				author: {
					name: message.author.tag,
					icon_url: message.author.avatarURL({ dynamic: true }) || "",
				},
				footer: {
					text: message.client.user?.tag,
					icon_url: message.client.user?.avatarURL({ dynamic: true }) || "",
				},
			});

			let enabledCommands = "";
			for (const [key, dvalue] of new Map(message.util?.handler.categories!)) {
				// For each category
				for (const [key2, fvalue] of new Map(dvalue)) {
					// For each command in that category
					// Add it to the variable commands
					if (!oldSettings || !oldSettings.includes(fvalue.id))
						enabledCommands = enabledCommands + " `" + fvalue.aliases[0] + "`";
				}
			}
			embed.addField("Enabled", enabledCommands);
			if (oldSettings && oldSettings[0] !== undefined) {
				let disabledCommands = "";

				let current;
				for (let i = 0; (current = oldSettings[i]); i++) {
					const command = this.handler.findCommand(current);
					disabledCommands = disabledCommands + "`" + command.aliases[0] + "` ";
				}
				embed.addField("Disabled", disabledCommands);
			}

			return message.channel.send(embed);
		} else if (toDisable.category) {
			if (oldSettings && oldSettings.includes(toDisable.id))
				return message.channel.send(
					Error(
						message,
						this,
						"Invalid Argument",
						"That command is already disabled!"
					)
				);
			let disabledCommands;

			if (!oldSettings) disabledCommands = [];
			else disabledCommands = oldSettings;

			disabledCommands.push(toDisable.id);

			this.client.settings.set(
				message.guild!.id,
				"disabledCommands",
				JSON.stringify(disabledCommands)
			);
			return message.channel.send(
				new MessageEmbed({
					title:
						":white_check_mark: Disabled command: `" +
						toDisable.aliases[0] +
						"`",
					color: 16716032,
					timestamp: new Date(),
					author: {
						name: message.author.tag,
						icon_url: message.author.avatarURL({ dynamic: true }) || "",
					},
					footer: {
						text: message.client.user?.tag,
						icon_url: message.client.user?.avatarURL({ dynamic: true }) || "",
					},
				})
			);
		} else {
			// Try to resolve as a category
			if (message.util?.handler.findCategory(toDisable)) {
				const category = message.util?.handler.findCategory(toDisable);

				let disabledCommands = "";
				let commands;

				if (!oldSettings) commands = [];
				else commands = oldSettings;

				for (const [key, value] of new Map(category)) {
					if (oldSettings && !oldSettings.includes(key)) {
						commands.push(key);
						disabledCommands = disabledCommands + "`" + value.aliases[0] + "` ";
					} else if (!oldSettings) {
						commands.push(key);
						disabledCommands = disabledCommands + "`" + value.aliases[0] + "` ";
					}
				}
				this.client.settings.set(
					message.guild!.id,
					"disabledCommands",
					JSON.stringify(commands)
				);
				const embed = new MessageEmbed({
					title: ":white_check_mark: Disabled category: `" + category.id + "`",
					color: 16716032,
					timestamp: new Date(),
					author: {
						name: message.author.tag,
						icon_url: message.author.avatarURL({ dynamic: true }) || "",
					},
					footer: {
						text: message.client.user?.tag,
						icon_url: message.client.user?.avatarURL({ dynamic: true }) || "",
					},
					fields: [{ name: "Disabled", value: disabledCommands }],
				});

				return message.channel.send(embed);
			} else {
				return message.channel.send(
					Error(
						message,
						this,
						"Invalid Argument",
						"You must provide a command or a category!"
					)
				);
			}
		}
	}
}