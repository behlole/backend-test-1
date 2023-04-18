import { ID } from "../entities/Entity";
import User from "../entities/Blog";
import Blog from "../entities/Blog";

export default interface BlogRepository {
    persist(domainEntity: Blog): Promise<User | null>;

    merge(domainEntity: Blog): Promise<User | null>;

    remove(entityId: ID): Promise<boolean | null>;

    get(entityId: ID): Promise<User | null>;

    // getByEmail(email: string): Promise<Blog | null>;

    find(): Promise<User[]>;
};
