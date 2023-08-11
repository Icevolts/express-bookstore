process.env.NODE_ENV = 'test'

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let book_isbn;

beforeEach(async function() {
    let result = await db.query(`INSERT INTO books (isbn, amazon_url, author, language, pages, publisher, title, year)
    VALUES ('1234', 'https://amazon.com/asdf', 'Herbert Hoover', 'English', '538', 'Heresay LLC', 'This is Garbo', 1994)
    RETURNING isbn`);
    book_isbn = result.rows[0].isbn
});

describe('GET /books',function(){
    test('Gets a list of book(s)',async function(){
        const res = await request(app).get('/books');
        const list = res.body.books;
        expect(res.statusCode).toBe(200);
        expect(list).toHaveLength(1);
    });
});

describe('POST /books',function(){
    test('Add a book to the store',async function(){
        const res = await request(app).post('/books')
            .send({
                isbn: '12345',
                amazon_url: 'https://amazon.com/ghjk',
                author: 'Wizard',
                language: 'English',
                pages: '643',
                publisher: 'Nothing Publishers',
                title: 'What is this?',
                year: 3008
            });
        expect(res.statusCode).toBe(201);
        expect(res.body.book.author).toBe('Wizard');
    });
});

describe('PUT /books/:id',function(){
    test('Update a book',async function(){
        const res = await request(app).put(`/books/${book_isbn}`)
            .send({
                amazon_url: 'https://amazon.com/wert',
                author: 'Hebert Mover',
                language: 'Spanish',
                pages: '458',
                publisher: 'Not this One',
                title: 'HEELLOO',
                year: 2019
            });
        expect(res.body.book.title).toBe('HEELLOO')
    });
});

describe('DELETE /books/:id',function(){
    test('Delete a book',async function(){
        const res = await request(app).delete(`/books/${book_isbn}`)
        expect(res.body).toEqual({message: 'Book deleted'})
    });
});

afterEach(async function(){
    await db.query('DELETE FROM books');
});

afterAll(async function(){
    await db.end()
});