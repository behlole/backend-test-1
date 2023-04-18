import * as crypto from 'crypto';
import multer, {FileFilterCallback} from 'multer';
import path from 'path';
import sharp from 'sharp';
import fs from 'fs';
import {NextFunction, Request, Response} from "express";
import { Router } from 'express';
import BlogController from '../../controllers/BlogController';

const BlogRoutes = Router();


const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'images/');
  },
  filename(req, file, cb:any) {
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

const fileFilter = function (req:Request, file:any, cb:FileFilterCallback) {
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
  storage,
  fileFilter,
  limits: { fileSize: 1000000 }
});

const compressImage = async (req:Request, res:Response, next:NextFunction) => {
  if (!req.file && !req.files) {
    return next();
  }

  const compress = async (filePath:string) => {
    const { width, height } = await sharp(fs.readFileSync(filePath)).metadata();
    const newFilePath = `${filePath.split('.')[0]}_compressed.jpg`;
    try {
      const buffer = await sharp(filePath)
        .resize({ width: Math.round(width! * 0.25) })
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
    if (req.files && "additional_images" in req.files) {
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

BlogRoutes.get('/', BlogController.getBlogs);
BlogRoutes.post(
  '/',
  upload.fields([
    { name: 'main_image', maxCount: 1 },
    { name: 'additional_images', maxCount: 5 }
  ]),
  compressImage,
  addBlog,
);
BlogRoutes.post('/create-token', createTemporaryToken);
BlogRoutes.post('/image', verifyImage);

export default BlogRoutes;
