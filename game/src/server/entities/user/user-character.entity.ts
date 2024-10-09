import type { Rel } from "@mikro-orm/core";
import { Entity, PrimaryKey, Property, ManyToOne, Index } from "@mikro-orm/core";
import { Character } from "../character";
import { User } from "./user.entity";

@Entity({ tableName: "user_characters" })
export class UserCharacter {
    @PrimaryKey({ autoincrement: true })
    public readonly id!: number;

    @Property({ version: true })
    public readonly version!: number; // Optimistic Locking

    @ManyToOne(() => User)
    @Index()
    public readonly owner: Rel<User>;

    @ManyToOne(() => Character)
    @Index()
    public readonly character: Rel<Character>;

    @Property({ default: 0 })
    @Index()
    public currentLevel: number;

    @Property()
    public readonly unlockedAt: Date;

    constructor(owner: Rel<User>, character: Character) {
        this.owner = owner;
        this.character = character;
        this.currentLevel = 0;
        this.unlockedAt = new Date();
    }
}
