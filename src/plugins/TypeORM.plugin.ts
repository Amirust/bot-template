import "reflect-metadata";
import { DataSource, EntityMetadata } from "typeorm";
import { IPlugin } from "@BotTemplate/types/IPlugin";
import fs from "node:fs/promises";

export default class TypeORMPlugin implements IPlugin {
	public name: string = "TypeORM";
	public registerAs: string = "db";
	private dataSource: DataSource;

	async init(): Promise<void> {
		bot.logger.log("TypeORM plugin started to initialize");
		this.dataSource = new DataSource({
			type: "mongodb",
			url: bot.config.get<string>("db"),
			database: bot.config.get<string>("dbName"),
			synchronize: true,
			logging: false,
			cache: true,
			entities: await Promise.all((await fs.readdir("./dist/entity")).map(async file => (await import(`@BotTemplate/entity/${file}`)).default))
		});
	}

	async postSetup(): Promise<void> {
		await this.dataSource.initialize().then(() => bot.logger.log("TypeORM plugin connected to database"));
		this.dataSource.entityMetadatas.map((metadata: EntityMetadata) => bot.store.set(metadata.name, this.dataSource.getMongoRepository(metadata.name)));
		bot.logger.log(`TypeORM plugin cache added to store ${this.dataSource.entityMetadatas.length} collections`);

	}

	async restart(): Promise<void> {
		await this.dataSource.destroy();
		return this.postSetup();
	}

	unload(): Promise<void> {
		return this.dataSource.destroy();
	}
}
