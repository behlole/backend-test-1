const RequestResponseMappings = require('../mappings/RequestResponseMappings');
const {getBlogs, addBlog, createTemporaryToken, verifyImage} = require("../Controller/BlogController");
const appRouter = require('express').Router();
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const sharp = require("sharp");
const fs = require("fs");

// Set up storage location for files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images/');
    },
    filename: function (req, file, cb) {
        crypto.randomBytes(16, (err, buf) => {
            if (err) {
                cb(err);
            } else {
                const ext = path.extname(file.originalname);
                const filename = buf.toString('hex') + ext;
                cb(null, filename);
            }
        });
    }
});

// Define file filter function
const fileFilter = function (req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('File type not supported!'));
    }
    if (path.extname(file.originalname) !== '.jpg') {
        return cb(new Error('Only .jpg files are allowed!'));
    }
    if (file.size > 1000000) {
        return cb(new Error('File size too large! Max size is 1MB.'));
    }
    cb(null, true);
};
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 1000000 },
    options: {
        imageSize: true
    }
});

const compressImage = async (req, res, next) => {
    if (!req.file && !req.files) {
        return next();
    }

    const compress = async (filePath) => {
        const { width, height } = await sharp(fs.readFileSync(filePath)).metadata();
        const newFilePath = `${filePath.split(".")[0]}_compressed.jpg`;
        try {
            let buffer = await sharp(filePath)
                .resize({ width: Math.round(width * 0.25) })
                .toFile(newFilePath);
            // Delete original image file
            await fs.promises.unlink(filePath);
            await fs.promises.rename(newFilePath, filePath);
            // Return compressed image filename
            return path.basename(filePath);
        } catch (err) {
            throw err;
        }
    };

    try {
        // Compress main image
        if (req.file) {
            req.body.main_image = await compress(req.file.path);
        }
        // Compress additional images
        if (req.files && req.files.additional_images) {
            const additionalImages = Array.isArray(req.files.additional_images)
                ? req.files.additional_images
                : [req.files.additional_images];
            const compressedImages = await Promise.all(
                additionalImages.map((file) => compress(file.path))
            );
            req.body.additional_images = compressedImages;
        }
        next();
    } catch (err) {
        next(err);
    }
};

appRouter.get('/', getBlogs);
appRouter.post('/',
    upload.fields([
        { name: 'main_image', maxCount: 1 },
        { name: 'additional_images', maxCount: 5 }
    ]),
    compressImage,
    addBlog,
);
appRouter.get('/create-token',createTemporaryToken);
appRouter.get('/image',verifyImage);

module.exports = appRouter;
