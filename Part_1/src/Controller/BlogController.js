const RequestResponseMappings = require("../mappings/RequestResponseMappings");

const BlogValidation = require('../SchemaValidation/BlogValidation');

let blogs = require('../../blogs.json');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const {returnErrorMessage} = require("../mappings/RequestResponseMappings");

const rawData = fs.readFileSync('blogs.json');

module.exports = {
    getBlogs: (req, res) => {
        /**
         * Converting
         */
        return RequestResponseMappings.returnSuccessMessage(
            res,
            blogs.map(singleBlog => (
                    {
                        ...singleBlog,
                        date_time: new Date(singleBlog.date_time * 1000)
                            .toISOString(),
                        title_slug: singleBlog.title.replace(/\s+/g, '_')
                    }
                )
            )
        );
    },
    addBlog: async (req, res) => {
        if (req.files) {
            req.body.main_image = req.files.main_image[0].path;
            let additional_images = [];
            if (req.files && "additional_images" in req.files) {
                req.files.additional_images.forEach((singleAdditionalImage) => {
                    additional_images.push(singleAdditionalImage.path);
                })
            }
            req.body.additional_images = additional_images;
        }
        let blogSchemaValidationError = BlogValidation.validate(req.body).error;

        if (blogSchemaValidationError) {
            return RequestResponseMappings.returnErrorMessage(res, blogSchemaValidationError.details, blogSchemaValidationError.details[0].message);
        }
        let data = JSON.parse(rawData);
        req.body.reference = `0000${data.length + 1}`
        data.push(req.body);
        await fs.writeFileSync('blogs.json', JSON.stringify(data));
        return RequestResponseMappings.returnSuccessMessage(
            res,
            data.map(singleBlog => {
                return {
                    ...singleBlog,
                    date_time: new Date(singleBlog.date_time * 1000).toISOString(),
                    title_slug: singleBlog.title.replace(/\s+/g, '_')
                }
            })
        );
    },
    createTemporaryToken: async (req, res) => {
        try {
            let {image_path} = req.body;
            let secret = process.env.JWT_SECRET_KEY;
            if (!image_path && secret) {
                throw("Image Path not provided");
            }
            let found = false;
            blogs.forEach((singleBlog) => {
                if (singleBlog.main_image === image_path) {
                    found = true;
                }
            })
            if (found) {
                let token = await jwt.sign({image_path: image_path}, secret, {expiresIn: '5m'})
                return RequestResponseMappings.returnSuccessMessage(res, {token: token});
            }
            throw "Image Path Not found"
        } catch (e) {
            return returnErrorMessage(res, {}, e)
        }

    },
    verifyImage: async (req, res) => {
        try {
            let {image_path, token} = req.body;
            let secret = process.env.JWT_SECRET_KEY;
            if (!image_path || !token || !secret) {
                throw("Image Path or Token not provided");
            }
            const decoded = jwt.verify(token, secret);
            if (decoded.image_path==image_path){
                const imgData = fs.readFileSync(image_path);
                const base64Img = Buffer.from(imgData).toString('base64');
                return RequestResponseMappings.returnSuccessMessage(res, {image: base64Img});
            }
            throw "Bad Token"
        } catch (e) {
            return returnErrorMessage(res, {}, e)
        }
    }

}
