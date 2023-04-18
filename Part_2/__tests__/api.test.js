const request = require('supertest');
const fs = require('fs')
const FormData = require('form-data');
const path = require('path');
describe('Blog Route Handlers', () => {
    const BASE_HREF = "http://localhost:3000"
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

        it('add blog post and get all blog posts', async () => {
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
            expect(response.body.body.length).toBeGreaterThan(1);
        });
        it('add invalid blog post and get blog post to retrieve that blog post is not added', async () => {
            const formData = new FormData();
            const response = await request(BASE_HREF)
                .post('/')
                .set('Content-Type', 'multipart/form-data')
                .field('title', '1')
                .field('description', 'Description')
                .field('date_time', '1671017885')
                .attach('main_image', fs.createReadStream(path.join(__dirname, 'normal.jpg')));


            expect(response.statusCode).toBe(500);
        });
        it('Get token from Generate token API and send to Get image by token API successful Test', async () => {
            new FormData();
            let response = await request(BASE_HREF)
                .post('/create-token')
                .set('Content-Type', 'application/json')
                .send({'image_path': 'images/f1e69096840b580a92fe371fa730f653.jpg'})
            expect(response.body.message).toBe("Action Performed Successfully")
            response = await request(BASE_HREF)
                .post('/image')
                .set('Content-Type', 'application/json')
                .send({
                    'image_path': 'images/f1e69096840b580a92fe371fa730f653.jpg',
                    'token':response.body.body.token
                })
            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe("Action Performed Successfully")
        });
        it('Get token from Generate token API and send to Get image by token API failed Test', async () => {
            new FormData();
            let response = await request(BASE_HREF)
                .post('/create-token')
                .set('Content-Type', 'application/json')
                .send({'image_path': 'images/f1e69096840b580a92fe371fa730f653.jpg'})
            expect(response.body.message).toBe("Action Performed Successfully")
            response = await request(BASE_HREF)
                .post('/image')
                .set('Content-Type', 'application/json')
                .send({
                    'image_path': 'images/8359faf710d2b2468ed3976af3f797ce.jpg',
                    'token':response.body.body.token
                })
            expect(response.statusCode).toBe(500);
            expect(response.body.reason).toBe("Bad Token")
        });
    })

})
