# Books REST API

![CI](https://github.com/Lukegbb/books-rest-api-node/actions/workflows/ci.yml/badge.svg)

A small REST API for managing a list of books, built with **Node.js and Express**.
It started as a basic CRUD exercise and I've since added validation, filtering, pagination and automated tests.

## Features

- Full CRUD: `GET`, `POST`, `PUT` (replace) and `PATCH` (partial update), `DELETE`
- Input validation with clear error messages (`400` with a list of errors)
- Filter by author, search by title or author, sort by year or title
- Pagination (`page` and `limit`)
- Proper `404` responses and handling of malformed JSON
- App and data store kept separate, so the in-memory store could be replaced by a database
- Tests with Jest + Supertest, running on GitHub Actions

## Getting started

```bash
npm install
npm start          # http://localhost:3000
npm test
```

## Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/books` | List books. Query params: `author`, `search`, `sort` (`year`/`title`), `page`, `limit` |
| GET | `/books/:id` | Get one book |
| POST | `/books` | Create a book |
| PUT | `/books/:id` | Replace a book |
| PATCH | `/books/:id` | Update some fields |
| DELETE | `/books/:id` | Delete a book |

### Example

```bash
curl -X POST http://localhost:3000/books \
  -H "Content-Type: application/json" \
  -d '{"title": "Dubliners", "author": "James Joyce", "year": 1914}'
```

```json
{ "id": 5, "title": "Dubliners", "author": "James Joyce", "year": 1914 }
```

Validation error example:

```json
{ "errors": ["title is required", "author is required"] }
```

## Project structure

```
├── src/
│   ├── app.js      # routes, validation, error handling
│   ├── store.js    # in-memory data store
│   └── server.js   # starts the HTTP server
└── tests/
    └── books.test.js
```
