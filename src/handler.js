const { nanoid } = require('nanoid');
const books = require('./books');

const addBooksHandler = (request, h) => {
  const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;

  if (!name) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }

  if (pageCount < readPage) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }

  const id = nanoid(16);
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;
  const finished = pageCount === readPage;

  const newBook = {
    name, year, author, summary, publisher, pageCount, readPage, reading, id, insertedAt, updatedAt, finished
  };

  books.push(newBook);

  const isSuccess = books.filter((book) => book.id === id).length > 0;

  if (isSuccess) {
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id,
      },
    });
    response.code(201);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku gagal ditambahkan',
  });
  response.code(500);
  return response;
};

const getAllBooksHandler = (request, h) => {
  const { name, reading, finished } = request.query;
  let filteredBooks = books;

  if (name) {
    const lowerCaseName = name.toLowerCase();
    filteredBooks = filteredBooks.filter((book) =>
      book.name.toLowerCase().includes(lowerCaseName)
    );
  }

  // Filter berdasarkan reading (0 = false, 1 = true)
  if (reading !== undefined) {
    const isReading = reading === '1' || reading === true;
    filteredBooks = filteredBooks.filter((book) => book.reading === isReading);
  }

  // Filter berdasarkan finished (0 = false, 1 = true)
  if (finished !== undefined) {
    const isFinished = finished === '1' || finished === true;
    filteredBooks = filteredBooks.filter((book) => book.finished === isFinished);
  }

  const response = h.response({
    status: 'success',
    data: {
      books: filteredBooks.map(({ id, name, publisher }) => ({
        id,
        name,
        publisher,
      })),
    },
  });
  response.code(200);
  return response;
};

const getBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const book = books.find((b) => b.id === bookId);

  if (!book) {
    const response = h.response({
      status: 'fail',
      message: 'Buku tidak ditemukan'
    });
    response.code(404);
    return response;
  };

  const response = h.response({
    status: 'success',
    data: {
      book
    }
  });
  response.code(200);
  return response;
};

const editBookByIdHandler = (request, h) => {
  const { bookId } = request.params;
  const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;

  if (!name) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Mohon isi nama buku'
    });
    response.code(400);
    return response;
  }

  if (pageCount < readPage) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount'
    });
    response.code(400);
    return response;
  }

  const finished = pageCount === readPage;
  const updatedAt = new Date().toISOString();

  const index = books.findIndex((book) => book.id === bookId);

  if (index !== -1) {
    books[index] = {
      ...books[index],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
      finished,
      updatedAt
    };
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil diperbarui'
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Gagal memperbarui buku. Id tidak ditemukan'
  });
  response.code(404);
  return response;
};

const deleteBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const index = books.findIndex((book) => book.id === bookId);

  if (index !== -1) {
    books.splice(index, 1);
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

module.exports = { addBooksHandler, getAllBooksHandler, getBookByIdHandler, editBookByIdHandler, deleteBookByIdHandler };