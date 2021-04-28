import { ShardingManager } from "discord.js";
import bunyan from "bunyan";
import db from "./utils/db";
const { token } = require("../config.json");
let log = bunyan.createLogger({ name: "shardmanager" });

db.sync();

import "./web";

let manager: ShardingManager;
if (require.main === module) {
	if (process.env.NODE_ENV !== "production")
		manager = new ShardingManager("./bot.ts", {
			token: token,
			execArgv: ["-r", "ts-node/register"],
		});
	else
		manager = new ShardingManager("./bot.js", {
			token: token,
		});
	manager.on("shardCreate", (shard) => log.info(`Launched shard ${shard.id}`));
	manager.spawn();
}

export { manager, log };
