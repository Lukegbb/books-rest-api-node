const express = require('express');
const cors = require('cors');
const { BookStore } = require('./store');

function validateBook(body, { partial = false } = {}) {
  const errors = [];
  const { title, author, year } = body;
  const currentYear = new Date().getFullYear();

  if (!partial || title !== undefined) {
    if (typeof title !== 'string' || !title.trim()) errors.push('title is required');
  }
  if (!partial || author !== undefined) {
    if (typeof author !== 'string' || !author.trim()) errors.push('author is required');
  }
  if (year !== undefined && (!Number.isInteger(year) || year < 0 || year > currentYear)) {
    errors.push(`year must be a whole number between 0 and ${currentYear}`);
  }
  return errors;
}

function createApp(store = new BookStore()) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // GET /books?author=orwell&sort=year&page=1&limit=10
  app.get('/books', (req, res) => {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const { items, total } = store.list({
      author: req.query.author,
      search: req.query.search,
      sort: req.query.sort,
      page,
      limit,
    });
    res.json({ items, total, page, limit });
  });

  app.get('/books/:id', (req, res) => {
    const book = store.get(Number(req.params.id));
    if (!book) return res.status(404).json({ message: 'Book not found' });
    return res.json(book);
  });

  app.post('/books', (req, res) => {
    const errors = validateBook(req.body);
    if (errors.length) return res.status(400).json({ errors });
    const { title, author, year } = req.body;
    return res.status(201).json(store.create({ title: title.trim(), author: author.trim(), year }));
  });

  // PUT replaces the whole book, PATCH updates only the fields sent.
  app.put('/books/:id', (req, res) => {
    const errors = validateBook(req.body);
    if (errors.length) return res.status(400).json({ errors });
    const { title, author, year } = req.body;
    const book = store.replace(Number(req.params.id), { title: title.trim(), author: author.trim(), year });
    if (!book) return res.status(404).json({ message: 'Book not found' });
    return res.json(book);
  });

  app.patch('/books/:id', (req, res) => {
    const errors = validateBook(req.body, { partial: true });
    if (errors.length) return res.status(400).json({ errors });
    const book = store.update(Number(req.params.id), req.body);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    return res.json(book);
  });

  app.delete('/books/:id', (req, res) => {
    if (!store.remove(Number(req.params.id))) {
      return res.status(404).json({ message: 'Book not found' });
    }
    return res.status(204).end();
  });

  app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

  // Malformed JSON and unexpected errors
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ message: 'Invalid JSON body' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  });

  return app;
}

module.exports = { createApp, validateBook };
