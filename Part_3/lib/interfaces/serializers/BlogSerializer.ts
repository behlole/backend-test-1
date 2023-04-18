import { ServiceLocator } from "../../infrastructure/config/service-locator";
import Serializer from "./Serializer";
import Blog from "../../domain/entities/Blog";

export default class BlogSerializer extends Serializer {
    _serializeSingleEntity(entity: Blog, serviceLocator: ServiceLocator): object {
        const blogObj = {
            'id': entity.id,
            'title':entity.title,
            'description':entity.description,
            'main_image':entity.main_image,
            'additional_images':entity.additional_images,
            'reference':entity.reference
        };
        return blogObj;
    }
};
