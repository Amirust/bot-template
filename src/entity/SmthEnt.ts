import { Column, Entity, ObjectId, ObjectIdColumn } from "typeorm";

@Entity()
class SmthEnt {

		@ObjectIdColumn()
			id: ObjectId;

		@Column()
			kavo: number;
}

export default SmthEnt;