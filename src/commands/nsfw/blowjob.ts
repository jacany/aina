import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

export default class BlowjobCommand extends Command {
	constructor() {
		super("blowjob", {
			aliases: ["blowjob", "bj"],
			description: "Shows an NSFW image",
			category: "NSFW",

			nsfw: true,
		});
	}

	async exec(message: Message): Promise<any> {
		let image;
		try {
			image = await this.client.hentai.nsfw.blowJob();
		} catch (error) {
			this.client.log.error(error);
			return message.channel.send(
				this.client.error(
					message,
					this,
					"An error occurred",
					"There was an error retrieving the image."
				)
			);
		}

		return message.channel.send(
			new MessageEmbed({
				title: `Blowjob`,
				color: message.guild?.me?.displayHexColor,
				image: {
					url: image.url,
				},
				timestamp: new Date(),
				footer: {
					text: message.author.tag,
					icon_url: message.author.displayAvatarURL({
						dynamic: true,
					}),
				},
			})
		);
	}
}
