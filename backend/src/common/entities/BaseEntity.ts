import {Field, ID, ObjectType} from "type-graphql";
import {BeforeInsert, CreateDateColumn, PrimaryColumn, UpdateDateColumn} from "typeorm";
import {ulid} from "ulid";

@ObjectType()
export abstract class BaseEntity {
    @Field((_type) => ID)
    @PrimaryColumn()
    id!: string;

    @Field()
    @CreateDateColumn()
    createdAt!: Date;

    @Field()
    @UpdateDateColumn()
    updatedAt!: Date;

    @BeforeInsert()
    setId() {
        if (!this.id) {
            this.id = ulid();
        }
    }
}
