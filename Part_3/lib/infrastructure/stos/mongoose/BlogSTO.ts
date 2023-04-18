
import Blog from '../../../domain/entities/Blog';

export default (schemaEntity: any): Blog | null => {
    if (!schemaEntity) return null;
    return new Blog({
        date_time: "",
        id: schemaEntity.id,
        title: schemaEntity.title,
        description: schemaEntity.description,
        main_image: schemaEntity.main_image,
        additional_images: schemaEntity.additional_images,
        reference: schemaEntity.reference,
        users:schemaEntity.users
    });
};
