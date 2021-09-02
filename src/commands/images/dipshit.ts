import Command from "../../struct/Command";
import { Message, MessageEmbed, MessageAttachment } from "discord.js";
import axios, { AxiosResponse } from "axios";

export default class DipshitCommand extends Command {
	constructor() {
		super("dipshit", {
			aliases: ["dipshit"],
			description:
				"Generates a google 'did you mean dipshit' meme, with the search being your inputted text.",
			category: "Images",
			args: [
				{
					id: "text",
					type: "string",
				},
			],
		});
	}

	async _getImage(text: string): Promise<AxiosResponse> {
		return axios.get(this.client.config.imgApiUrl + "/dipshit", {
			params: {
				text: text,
			},
			responseType: "stream",
		});
	}

	async exec(message: Message, args: any): Promise<any> {
		if (!args.text)
			return message.channel.send({
				embeds: [
					this.error(
						message,
						"Invalid Arguments",
						"You must provide some text!"
					),
				],
			});

		const loadMessage = await message.channel.send(
			this.client.emoji.loading + "*Please wait..*"
		);

		const image = await this._getImage(message.util?.parsed?.content!);

		const attachment = new MessageAttachment(image.data, "image.png");

		loadMessage.delete();

		return message.channel.send({
			embeds: [
				this.embed(
					{
						title: "Dipshit",
						image: {
							url: "attachment://image.png",
						},
					},
					message
				),
			],
			files: [attachment],
		});
	}
}
