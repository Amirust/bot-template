import { IPlugin } from "@BotTemplate/types/IPlugin";
import { Collection as MongoCollection, Document, MongoClient, ObjectId } from "mongodb";
import { CacheProvider } from "@BotTemplate/types/CacheProvider";
import { IDBCategory } from "@BotTemplate/types/IDBCategory";

export default class MongoDBPlugin implements IPlugin {
	public name: string = "mongodb";
	public registerAs: string = "db";
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
		collections.map(collection => bot.store.set(collection.collectionName, new Collection(collection)));
		bot.logger.log(`MongoDBPlugin cache added to store ${collections.length} collections`);
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
		if (filter.hasOwnProperty("_id")) {
			const cached = await bot.cache.get<T>(filter["_id"]);
			if (cached !== null) return cached;
			else {
				const cached = bot.cache.findByOwnProperties<T>(filter);
				if (cached?.length > 0) return cached[0];
				else {
					const res = await this.dbCollection.findOne<T>({ ...filter, _id: new ObjectId(filter["_id"]) });
					if (res !== null) await bot.cache.set(res._id.toString(), res);
					return res as T;
				}
			}
		} else return null;
	}

	async find<T extends Document>(filter: { [key: string]: string }): Promise<T[]> {
		const results = await this.dbCollection.find<T>(filter ?? {}).toArray();
		results.map(async result => await bot.cache.set(result._id.toString(), result));
		return results;
	}

	async insertOne<T extends Document>(doc: T): Promise<void> {
		const { insertedId } = await this.dbCollection.insertOne(doc);
		await bot.cache.set(insertedId.toString(), doc);
	}

	async insertMany<T extends Document>(...docs: T[]): Promise<void> {
		const { insertedIds } = await this.dbCollection.insertMany(docs);
		Object.values(insertedIds).map(async (id, index) => await bot.cache.set(id.toString(), docs[index]));
	}

	async updateOne(filter: { [key: string]: string }, update: { [key: string]: string }): Promise<void> {
		const { upsertedId } = await this.dbCollection.updateOne(filter, update);
		if (upsertedId) await bot.cache.set(upsertedId.toString(), update);
	}

	async deleteOne(filter: { [key: string]: string }): Promise<void> {
		if (filter.hasOwnProperty("_id")) {
			const { deletedCount } = await this.dbCollection.deleteOne({ _id: new ObjectId(filter["_id"]) });
			if (deletedCount > 0) await bot.cache.delete(filter["_id"]);
		} else {
			const allCached = bot.cache.findByOwnProperties<{ _id: ObjectId }>(filter);
			const { deletedCount } = await this.dbCollection.deleteOne({ _id: allCached[0]?._id });
			if (deletedCount > 0) await bot.cache.delete(allCached[0]._id.toString());
		}
	}

	async deleteMany(filter: { [key: string]: string }): Promise<void> {
		await this.dbCollection.deleteMany(filter);
		bot.cache.deleteByOwnProperties(filter);
	}
}