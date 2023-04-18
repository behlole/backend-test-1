import MongooseBlog from "../../orm/mongoose/schemas/Blog";
import BlogRepository from "../../../domain/repositories/BlogRepository";
import BlogSTO from "../../stos/mongoose/BlogSTO";
import {ID} from "../../../domain/entities/Entity";
import Blog from "../../../domain/entities/Blog";

export default class BlogRepositoryMongo implements BlogRepository {
    async persist(domainEntity: Blog): Promise<Blog | null> {
        const {
            title,
            description,
            main_image,
            additional_images,
            date_time,
            reference

        } = domainEntity;
        const mongooseBlog = new MongooseBlog({
            title,
            description,
            main_image,
            additional_images,
            date_time,
            reference
        });
        await mongooseBlog.save();
        return BlogSTO(mongooseBlog);
    }

    async merge(domainEntity: Blog): Promise<Blog | null> {
        const {
            id,
            title,
            description,
            main_image,
            additional_images,
            date_time,
            reference
        } = domainEntity;
        const mongooseBlog = await MongooseBlog.findByIdAndUpdate(
            id,
            {
                title,
                description,
                main_image,
                additional_images,
                date_time,
                reference
            },
            {
                new: true,
            }
        );
        return BlogSTO(mongooseBlog);
    }

    async remove(entityId: ID): Promise<boolean | null> {
        return MongooseBlog.findOneAndDelete({_id: entityId});
    }

    async get(entityId: ID): Promise<Blog | null> {
        const mongooseBlog = await MongooseBlog.findById(entityId);
        if (!mongooseBlog) return null;
        return BlogSTO(mongooseBlog);
    }

    // async getByEmail(email: string): Promise<User | null> {
    //     const mongooseUser = await MongooseUser.findOne({email});
    //     if (!mongooseUser) return null;
    //     return UserSTO(mongooseUser);
    // }

    async find(): Promise<Blog[]> {
        const mongooseBlogs = await MongooseBlog.find().sort({createdAt: -1});
        return mongooseBlogs.map((mongooseBlog) => {
                return BlogSTO(mongooseBlog);
            })
            .filter((blog: Blog | null): blog is Blog => blog != null);
    }
}
