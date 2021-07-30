import Command from "../../struct/Command";
import { Message, MessageEmbed } from "discord.js";
import { get } from "reddit-grabber";

export default class HentaiCommand extends Command {
	constructor() {
		super("hentai", {
			aliases: ["hentai"],
			description: "See Hentai",
			category: "NSFW",
			nsfw: true,
		});
	}

	async exec(message: Message) {
		const request = await get("image", "hentai", true);

		return message.channel.send(
			new MessageEmbed({
				title: "Hentai",
				color: message.guild?.me?.displayHexColor,
				timestamp: new Date(),
				image: {
					url: request.media,
				},
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