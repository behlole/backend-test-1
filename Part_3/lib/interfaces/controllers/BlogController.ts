import {ServiceLocator} from "../../infrastructure/config/service-locator";

const fs = require('fs');
const jwt = require('jsonwebtoken');
import {Response, Request} from "express";
import ListBlogs from "../../application/use_cases/blog/ListBlogs";
import Blog from "../../domain/entities/Blog";
import RequestResponseMappings from "../utils/RequestResponseMappings";
import BlogValidator from "../../domain/validators/BlogValidator";
import CreateBlog from "../../application/use_cases/blog/createBlog";
import UpdateUser from "../../application/use_cases/user/UpdateUser";
import {ValidationError} from "joi";
import UpdateBlog from "../../application/use_cases/blog/UpdateBlog";
import DeleteUser from "../../application/use_cases/user/DeleteUser";
import DeleteBlog from "../../application/use_cases/blog/DeleteBlog";
import GetUser from "../../application/use_cases/user/GetUser";

import lodash from 'lodash';


const BlogController = {
    getBlogs: async (req: Request, res: Response) => {
        const serviceLocator: ServiceLocator = req.serviceLocator!;

        // Treatment
        let blogs = await ListBlogs(serviceLocator);

        // Output
        blogs = blogs.map((singleBlog: any) => {
            return (
                {
                    ...singleBlog,
                    date_time: new Date(singleBlog.date_time * 1000)
                        .toISOString(),
                    title_slug: singleBlog.title.replace(/\s+/g, '_')
                }
            );
        })
        return RequestResponseMappings.returnSuccessMessage(
            res,
            blogs
        )
    },
    addBlog: async (req: Request, res: Response) => {
        if (req.files && "main_image" in req.files) {
            req.body.main_image = req.files.main_image[0].path;
            let additional_images: string[] = [];
            if (req.files && 'additional_images' in req.files) {
                req.files.additional_images.forEach((singleAdditionalImage) => {
                    additional_images.push(singleAdditionalImage.path);
                });
            }
            req.body.additional_images = additional_images;
        }
        const blogSchemaValidationError = BlogValidator.validate(req.body).error;

        if (blogSchemaValidationError) {
            return RequestResponseMappings.returnErrorMessage(res, blogSchemaValidationError.details, blogSchemaValidationError.details[0].message);
        }
        const serviceLocator: ServiceLocator = req.serviceLocator!;
        const blogs = await ListBlogs(serviceLocator);
        let singleUser = [];
        singleUser.push(req.userId);
        req.body.users = singleUser;
        req.body.reference = `0000${blogs.length + 1}`;
        let createdBlog = await CreateBlog(req.body, serviceLocator);
        let singleUserData = await GetUser(req.userId!, serviceLocator);
        singleUserData.phone = "1111111111";
        if (singleUserData.blogs && createdBlog && createdBlog.id) {
            singleUserData.blogs.push(createdBlog.id);
            singleUserData.blogs=lodash.flatten(singleUserData.blogs)
        }
        let updatedUser = await UpdateUser(singleUserData, serviceLocator)
        blogs.push(req.body);
        return RequestResponseMappings.returnSuccessMessage(
            res,
            blogs.map((singleBlog: any) => ({
                ...singleBlog,
                date_time: new Date(singleBlog.date_time * 1000).toISOString(),
                title_slug: singleBlog.title.replace(/\s+/g, '_')
            }))
        );
    },
    createTemporaryToken: async (req: Request, res: Response) => {
        try {
            const {image_path} = req.body;
            const secret = process.env.JWT_SECRET_KEY;
            if (!image_path && secret) {
                throw ('Image Path not provided');
            }
            let found = false;
            const serviceLocator: ServiceLocator = req.serviceLocator!;
            const blogs = await ListBlogs(serviceLocator);
            blogs?.forEach((singleBlog: any) => {
                if (singleBlog.main_image === image_path) {
                    found = true;
                }
            });
            if (found) {
                const token = await jwt.sign({image_path}, secret, {expiresIn: '5m'});
                return RequestResponseMappings.returnSuccessMessage(res, {token});
            }
            throw 'Image Path Not found';
        } catch (e: any) {
            return RequestResponseMappings.returnErrorMessage(res, {}, e);
        }
    },
    verifyImage: async (req: Request, res: Response) => {
        try {
            const {image_path, token} = req.body;
            const secret = process.env.JWT_SECRET_KEY;
            if (!image_path || !token || !secret) {
                throw ('Image Path or Token not provided');
            }
            const decoded = jwt.verify(token, secret);
            if (decoded.image_path == image_path) {
                const imgData = fs.readFileSync(image_path);
                const base64Img = Buffer.from(imgData).toString('base64');
                return RequestResponseMappings.returnSuccessMessage(res, {image: base64Img});
            }
            throw 'Bad Token';
        } catch (e: any) {
            return RequestResponseMappings.returnErrorMessage(res, {}, e);
        }
    },
    updateBlog: async (req: Request, res: Response) => {
        let error = null;
        let blog = null;
        const serviceLocator: ServiceLocator = req.serviceLocator!;
        try {
            req.body.blogId = req.params.id;

            blog = await UpdateBlog(req.body, serviceLocator);
        } catch (err) {
            if (err instanceof ValidationError) {
                error = err.details[0].message;
            } else if (err instanceof Error) {
                // 'Error occurred while creating user'
                error = err.message;
            }
        }

        // Output
        if (!blog) {
            return RequestResponseMappings.returnErrorMessage(res, {}, error!, 400)
        }
        const output = serviceLocator.userSerializer.serialize(blog, serviceLocator);
        return RequestResponseMappings.returnErrorMessage(res, output);
    },
    deleteBlog: async (req: Request, res: Response) => {
        // Context
        const serviceLocator: ServiceLocator = req.serviceLocator!;

        // Input
        const toDeleteBlogId = req.params.id;
        // Treatment
        let blog = null;
        try {
            blog = await DeleteBlog(toDeleteBlogId, serviceLocator);
        } catch (err: unknown) {
            if (err instanceof Error) {
                console.log(err);
            }
        }

        // Output
        if (!blog) {
            return RequestResponseMappings.returnErrorMessage(res, {}, "Not Found", 404);
        }
        return RequestResponseMappings.returnSuccessMessage(res, {}, "", 204);

    }

};
export default BlogController;
