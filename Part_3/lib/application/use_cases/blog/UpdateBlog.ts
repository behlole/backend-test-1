import BlogValidator from '../../../domain/validators/BlogValidator';
import GetBlog from "./GetBlog";
import { ServiceLocator } from '../../../infrastructure/config/service-locator';

export default async (blogData: any, serviceLocator: ServiceLocator) => {
    const { blogRepository } = serviceLocator;
    let blog = await GetBlog(blogData.blogId, serviceLocator);
    if (blog == null) throw new Error('Unknown ID');
    blog = { ...blog, ...blogData };
    await BlogValidator.tailor('update').validateAsync(blog);
    return blogRepository!.merge(blog);
};
