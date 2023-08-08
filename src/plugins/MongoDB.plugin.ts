import { IPlugin } from "@BotTemplate/types/IPlugin";
import {
	ChangeStreamDeleteDocument,
	ChangeStreamInsertDocument,
	ChangeStreamUpdateDocument,
	Collection as MongoCollection,
	Document,
	MongoClient
} from "mongodb";
import { CacheProvider } from "@BotTemplate/types/CacheProvider";
import { IDBCategory } from "@BotTemplate/types/IDBCategory";

export default class MongoDBPlugin implements IPlugin {
	public name: string = "mongodb";
	private dbName: string;
	private client: MongoClient;
	private cache: CacheProvider;

	async init(): Promise<void> {
		bot.logger.log("MongoDBPlugin started to initialize");
		const url = bot.config.get<string>("db");
		this.dbName = bot.config.get<string>("dbName");
		this.client = new MongoClient(url);
		await this.client.connect().then(() => bot.logger.log("MongoDBPlugin connected to database"));
	}

	async restart(): Promise<void> {
		await this.client.close();
		return this.init();
	}

	async unload(): Promise<void> {
		await this.client.close();
		await this.cache.clear();
	}

	async postSetup(): Promise<void> {
		this.cache = bot.cache;
		const allCollections = await this.db.collections();
		const collections = allCollections.filter(collection => !collection.collectionName.startsWith("system"));
		bot.logger.log(`MongoDBPlugin cache started to watch ${collections.length} collections`);
		collections.map(collection => bot.store.set(collection.collectionName, new Collection(collection)));

		collections.map(
			collection => collection.watch([
				{ $match: { operationType: { $in: ["insert", "update", "delete"] } } }
			]).on("change", (change: ChangeStreamInsertDocument | ChangeStreamUpdateDocument | ChangeStreamDeleteDocument) => {
				bot.logger.debug(`MongoDBPlugin cache received change WallTime: ${new Date(change.clusterTime!.toString()).toLocaleString()}`);
				switch (change.operationType) {
				case "insert":
					const doc = change.fullDocument;
					if (doc === undefined) return;
					this.cache.set(doc._id.toString(), doc);
					break;
				case "update":
					const updatedDoc = change.updateDescription!;
					if (updatedDoc === undefined) return;
					const key = change.documentKey!._id.toString();
					const value = this.cache.get(key);
					if (value === null) return;
					const newValue = { ...value, ...updatedDoc.updatedFields };
					this.cache.set(key, newValue);
					break;
				case "delete":
					this.cache.delete(change.documentKey!._id.toString()).catch(() => null);
				}
			})
		);
	}


	get db() {
		return this.client.db(this.dbName);
	}
}

export class Collection implements IDBCategory {
	public readonly dbCollection;

	constructor(dbCollection: MongoCollection) {
		this.dbCollection = dbCollection;
	}

	async findOne<T extends Document>(filter: { [key: string]: string }): Promise<T | null> {
		const hasId = filter.hasOwnProperty("_id");
		if (hasId) {
			const id = filter["_id"];
			const cached = await bot.cache.get<T>(id);
			if (cached !== null) return cached;
		} else {
			const cached = bot.cache.findByOwnProperties<T>(filter);
			if (cached?.length > 0) return cached[0];
		}
		const res = await this.dbCollection.findOne<T>(filter);
		if (res !== null) await bot.cache.set(res._id.toString(), res);
		return res as T;
	}

	async find<T extends Document>(filter: { [key: string]: string }): Promise<T[]> {
		const results = await this.dbCollection.find<T>({}).toArray();
		results.map(async result => await bot.cache.set(result._id.toString(), result));
		return results;
	}

	async insertOne<T extends Document>(doc: T): Promise<void> {
		await this.dbCollection.insertOne(doc);
	}

	async insertMany<T extends Document>(docs: T[]): Promise<void> {
		await this.dbCollection.insertMany(docs);
	}

	async updateOne(filter: { [key: string]: string }, update: { [key: string]: string }): Promise<void> {
		await this.dbCollection.updateOne(filter, update);
	}

	async deleteOne(filter: { [key: string]: string }): Promise<void> {
		await this.dbCollection.deleteOne(filter);
	}

	async deleteMany(filter: { [key: string]: string }): Promise<void> {
		await this.dbCollection.deleteMany(filter);
	}
}