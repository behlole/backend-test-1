import Blog from '../../../domain/entities/Blog';
import BlogValidator from '../../../domain/validators/BlogValidator';
import { ServiceLocator } from '../../../infrastructure/config/service-locator';

export default async (blogData: any, { blogRepository }: ServiceLocator) => {
    await BlogValidator.tailor('create').validateAsync(blogData);
    const blog = new Blog({
        additional_images: blogData?.additional_images,
        date_time: blogData.date_time,
        description:blogData.description,
        main_image: blogData.main_image,
        reference: blogData.reference,
        title: blogData.title,
        users:blogData.users

    });
    return blogRepository!.persist(blog);
};
