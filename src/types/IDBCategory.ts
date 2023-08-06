export interface IDBCategory {
	readonly dbCollection: any;
	findOne<T extends Document>(filter: { [key: string]: string }): Promise<T | null>;
	find<T extends Document>(filter: { [key: string]: string }): Promise<T[]>;

	insertOne<T extends Document>(doc: T): Promise<void>;
	insertMany<T extends Document>(docs: T[]): Promise<void>;

	updateOne<T extends Document>(filter: { [key: string]: string }, update: { [key: string]: string }): Promise<void>;

	deleteOne<T extends Document>(filter: { [key: string]: string }): Promise<void>;
	deleteMany<T extends Document>(filter: { [key: string]: string }): Promise<void>;
}