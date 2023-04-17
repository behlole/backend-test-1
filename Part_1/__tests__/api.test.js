const request = require('supertest');
const axios = require('axios');
const fs = require('fs')
const FormData = require('form-data');
const path = require('path');
describe('Blog Route Handlers', () => {
    const BASE_HREF = "http://localhost:3000"
    var filePath = path.join(__dirname, 'normal.jpg');
    var file = fs.readFileSync(filePath);
    // const fileData = fs.readFileSync('./normal.jpg');

    // const base64Data = Buffer.from(fileData).toString('base64');

    // const validBlogPost = {
    //     title: 'Test Blog Post',
    //     author: 'Test Author',
    //     date_time: 1619433900,
    //     content: 'This is a test blog post.',
    //     main_image:base64Data
    // };

    describe('GET /', () => {
        it('should return all blogs', async () => {
            let response = await request(BASE_HREF)
                .get('/')
                .expect(200);
            expect(response.body); // Assuming there is only one initial blog post
        });
    });
    describe('POST /', () => {
        it('should create a blog', async () => {
            const formData = new FormData();
            formData.append('title', '');
            formData.append('description', 'Description');
            formData.append('date_time', 1671017885);
            formData.append('main_image', fs.createReadStream(path.join(__dirname, 'normal.jpg')));


            const response = await request(BASE_HREF)
                .post('/')
                .set('Content-Type', 'multipart/form-data')
                .field('title', 'Title 232 JEST')
                .field('description', 'Description')
                .field('date_time', '1671017885')
                .attach('main_image', fs.createReadStream(path.join(__dirname, 'normal.jpg')));
            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe("Action Performed Successfully");
        });
        it('should not create a blog', async () => {
            const response = await request(BASE_HREF)
                .post('/')
                .set('Content-Type', 'multipart/form-data')
                .field('description', 'Description')
                .field('date_time', '1671017885')
                .attach('main_image', fs.createReadStream(path.join(__dirname, 'normal.jpg')));
            expect(response.statusCode).toBe(500);
            expect(response.body.reason).toBe('\"title\" is required');
        });
        it('should not create blog when main image exceeds 1MB', async () => {
            const response = await request(BASE_HREF)
                .post('/')
                .set('Content-Type', 'multipart/form-data')
                .field('title', 'Title 232 JEST')
                .field('description', 'Description')
                .field('date_time', '1671017885')
                .attach('main_image', fs.createReadStream(path.join(__dirname, 'large.jpg')));
            expect(response.statusCode).toBe(500);
            expect(response.body.reason).toBe("File too large");
        });
        it('should create a blog when title has special character', async () => {

            const response = await request(BASE_HREF)
                .post('/')
                .set('Content-Type', 'multipart/form-data')
                .field('title', 'test$sda')
                .field('description', 'Description')
                .field('date_time', '1671017885')
                .attach('main_image', fs.createReadStream(path.join(__dirname, 'normal.jpg')));
            expect(response.statusCode).toBe(500);
        });
        it('should create a blog when title has date_time is not unix', async () => {

            const response = await request(BASE_HREF)
                .post('/')
                .set('Content-Type', 'multipart/form-data')
                .field('title', 'test$sda')
                .field('description', 'Description')
                .field('date_time', '25th Feb')
                .attach('main_image', fs.createReadStream(path.join(__dirname, 'normal.jpg')));
            expect(response.statusCode).toBe(500);
        });
    })

})
