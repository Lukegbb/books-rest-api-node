// Simple in-memory store. Keeping it behind a small class means it could be
// swapped for a real database later without touching the routes.
const SEED = [
  { title: '1984', author: 'George Orwell', year: 1949 },
  { title: 'Animal Farm', author: 'George Orwell', year: 1945 },
  { title: 'Dom Casmurro', author: 'Machado de Assis', year: 1899 },
  { title: 'Ulysses', author: 'James Joyce', year: 1922 },
];

class BookStore {
  constructor(seed = SEED) {
    this.books = [];
    this.nextId = 1;
    seed.forEach((book) => this.create(book));
  }

  list({ author, search, sort, page = 1, limit = 10 } = {}) {
    let result = [...this.books];

    if (author) {
      const term = author.toLowerCase();
      result = result.filter((b) => b.author.toLowerCase().includes(term));
    }
    if (search) {
      const term = search.toLowerCase();
      result = result.filter(
        (b) => b.title.toLowerCase().includes(term) || b.author.toLowerCase().includes(term)
      );
    }
    if (sort === 'year' || sort === 'title') {
      result.sort((a, b) => (a[sort] > b[sort] ? 1 : a[sort] < b[sort] ? -1 : 0));
    }

    const start = (page - 1) * limit;
    return { items: result.slice(start, start + limit), total: result.length };
  }

  get(id) {
    return this.books.find((b) => b.id === id) || null;
  }

  create({ title, author, year = null }) {
    // A counter (not books.length + 1) so ids are never reused after a delete.
    const book = { id: this.nextId++, title, author, year };
    this.books.push(book);
    return book;
  }

  replace(id, { title, author, year = null }) {
    const index = this.books.findIndex((b) => b.id === id);
    if (index === -1) return null;
    this.books[index] = { id, title, author, year };
    return this.books[index];
  }

  update(id, changes) {
    const book = this.get(id);
    if (!book) return null;
    ['title', 'author', 'year'].forEach((field) => {
      if (changes[field] !== undefined) {
        book[field] = typeof changes[field] === 'string' ? changes[field].trim() : changes[field];
      }
    });
    return book;
  }

  remove(id) {
    const index = this.books.findIndex((b) => b.id === id);
    if (index === -1) return false;
    this.books.splice(index, 1);
    return true;
  }
}

module.exports = { BookStore };
