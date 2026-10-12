const request = require('supertest');
const { createApp } = require('../src/app');
const { BookStore } = require('../src/store');

let app;

beforeEach(() => {
  app = createApp(
    new BookStore([
      { title: '1984', author: 'George Orwell', year: 1949 },
      { title: 'Animal Farm', author: 'George Orwell', year: 1945 },
      { title: 'Ulysses', author: 'James Joyce', year: 1922 },
    ])
  );
});

describe('GET /books', () => {
  test('lists books with pagination info', async () => {
    const res = await request(app).get('/books');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(3);
    expect(res.body.items).toHaveLength(3);
  });

  test('filters by author and sorts by year', async () => {
    const res = await request(app).get('/books?author=orwell&sort=year');
    expect(res.body.items.map((b) => b.title)).toEqual(['Animal Farm', '1984']);
  });

  test('paginates results', async () => {
    const res = await request(app).get('/books?limit=2&page=2');
    expect(res.body.items).toHaveLength(1);
    expect(res.body.page).toBe(2);
  });
});

describe('single book', () => {
  test('returns 404 for a missing book', async () => {
    const res = await request(app).get('/books/999');
    expect(res.status).toBe(404);
  });

  test('creates a book', async () => {
    const res = await request(app)
      .post('/books')
      .send({ title: 'Dubliners', author: 'James Joyce', year: 1914 });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: 4, title: 'Dubliners' });
  });

  test('rejects invalid data', async () => {
    const res = await request(app).post('/books').send({ title: '', year: 3000 });
    expect(res.status).toBe(400);
    expect(res.body.errors).toHaveLength(3);
  });

  test('rejects malformed JSON', async () => {
    const res = await request(app)
      .post('/books')
      .set('Content-Type', 'application/json')
      .send('{"title": ');
    expect(res.status).toBe(400);
  });

  test('patches only the fields sent', async () => {
    const res = await request(app).patch('/books/1').send({ year: 1950 });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ title: '1984', year: 1950 });
  });

  test('does not reuse ids after a delete', async () => {
    await request(app).delete('/books/3').expect(204);
    const res = await request(app).post('/books').send({ title: 'New', author: 'Someone' });
    expect(res.body.id).toBe(4);
  });
});
