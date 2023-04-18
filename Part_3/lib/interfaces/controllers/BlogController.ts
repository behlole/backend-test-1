import {ServiceLocator} from "../../infrastructure/config/service-locator";

const fs = require('fs');
const jwt = require('jsonwebtoken');
import {Response,Request} from "express";
import ListBlogs from "../../application/use_cases/blog/ListBlogs";
import Blog from "../../domain/entities/Blog";
import RequestResponseMappings from "../utils/RequestResponseMappings";
import BlogValidator from "../../domain/validators/BlogValidator";
import CreateBlog from "../../application/use_cases/blog/createBlog";





const BlogController = {
  getBlogs: async (req: Request, res: Response) => {
    const serviceLocator: ServiceLocator = req.serviceLocator!;

    // Treatment
    let blogs = await ListBlogs(serviceLocator);

    // Output
     blogs = blogs.map((singleBlog:any) => {
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
  addBlog: async (req:Request, res:Response) => {
    if (req.files && "main_image" in req.files) {
      req.body.main_image = req.files.main_image[0].path;
      let additional_images:string[] = [];
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
    req.body.reference = `0000${blogs.length + 1}`;
    await CreateBlog(req.body,serviceLocator);
    blogs.push(req.body);
    return RequestResponseMappings.returnSuccessMessage(
      res,
      blogs.map((singleBlog:any) => ({
        ...singleBlog,
        date_time: new Date(singleBlog.date_time * 1000).toISOString(),
        title_slug: singleBlog.title.replace(/\s+/g, '_')
      }))
    );
  },
  createTemporaryToken: async (req:Request, res:Response) => {
    try {
      const { image_path } = req.body;
      const secret = process.env.JWT_SECRET_KEY;
      if (!image_path && secret) {
        throw ('Image Path not provided');
      }
      let found = false;
      const serviceLocator: ServiceLocator = req.serviceLocator!;
      const blogs = await ListBlogs(serviceLocator);
      blogs?.forEach((singleBlog:any) => {
        if (singleBlog.main_image === image_path) {
          found = true;
        }
      });
      if (found) {
        const token = await jwt.sign({ image_path }, secret, { expiresIn: '5m' });
        return RequestResponseMappings.returnSuccessMessage(res, { token });
      }
      throw 'Image Path Not found';
    } catch (e:any) {
      return RequestResponseMappings.returnErrorMessage(res,{},e);
    }
  },
  verifyImage: async (req:Request, res:Response) => {
    try {
      const { image_path, token } = req.body;
      const secret = process.env.JWT_SECRET_KEY;
      if (!image_path || !token || !secret) {
        throw ('Image Path or Token not provided');
      }
      const decoded = jwt.verify(token, secret);
      if (decoded.image_path == image_path) {
        const imgData = fs.readFileSync(image_path);
        const base64Img = Buffer.from(imgData).toString('base64');
        return RequestResponseMappings.returnSuccessMessage(res, { image: base64Img });
      }
      throw 'Bad Token';
    } catch (e:any) {
        return RequestResponseMappings.returnErrorMessage(res,{},e);
    }
  }

};
export default BlogController;
