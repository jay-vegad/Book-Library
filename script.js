const API_URL = 'https://api.freeapi.app/api/v1/public/books';
const booksContainer = document.getElementById('booksContainer');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const sortSelect = document.getElementById('sortSelect');
const listViewBtn = document.getElementById('listViewBtn');
const gridViewBtn = document.getElementById('gridViewBtn');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const currentPageSpan = document.getElementById('currentPage');

let currentPage = 1;
let totalPages = 1;
let booksData = [];

async function fetchBooks(page = 1) {
    try {
        const response = await fetch(`${API_URL}?page=${page}`);
        const data = await response.json();

        if (data.success) {
            booksData = data.data.data;
            totalPages = data.data.totalPages;
            renderBooks(booksData);
            updatePaginationControls(page);
        } else {
            console.error('Failed to fetch books');
        }
    } catch (error) {
        console.error('Error fetching books:', error);
    }
}

function renderBooks(books, viewType = 'grid') {
    booksContainer.innerHTML = '';
    booksContainer.className = viewType === 'grid' ? 'books-grid' : 'books-list';

    books.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.classList.add('book-card');

        const thumbnailUrl = book.volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/200x300?text=No+Image';

        const bookContent = viewType === 'grid'
            ? `
                <img src="${thumbnailUrl}" alt="${book.volumeInfo.title}">
                <div class="book-details">
                    <h3>${book.volumeInfo.title}</h3>
                    <p>Author: ${book.volumeInfo.authors?.join(', ') || 'Unknown'}</p>
                    <p>Published: ${book.volumeInfo.publishedDate || 'N/A'}</p>
                </div>
            `
            : `
                <div class="book-list-view">
                    <img src="${thumbnailUrl}" alt="${book.volumeInfo.title}">
                    <div class="book-details">
                        <h3>${book.volumeInfo.title}</h3>
                        <p>Author: ${book.volumeInfo.authors?.join(', ') || 'Unknown'}</p>
                        <p>Publisher: ${book.volumeInfo.publisher || 'N/A'}</p>
                        <p>Published Date: ${book.volumeInfo.publishedDate || 'N/A'}</p>
                    </div>
                </div>
            `;

        bookCard.innerHTML = bookContent;
        bookCard.addEventListener('click', () => {
            window.open(book.volumeInfo.infoLink, '_blank');
        });

        booksContainer.appendChild(bookCard);
    });
}

function filterBooks() {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredBooks = booksData.filter(book =>
        book.volumeInfo.title.toLowerCase().includes(searchTerm) ||
        (book.volumeInfo.authors && book.volumeInfo.authors.some(author =>
            author.toLowerCase().includes(searchTerm)
        ))
    );
    renderBooks(filteredBooks);
}

function sortBooks() {
    const sortValue = sortSelect.value;
    let sortedBooks = [...booksData];

    switch (sortValue) {
        case 'title-asc':
            sortedBooks.sort((a, b) => a.volumeInfo.title.localeCompare(b.volumeInfo.title));
            break;
        case 'title-desc':
            sortedBooks.sort((a, b) => b.volumeInfo.title.localeCompare(a.volumeInfo.title));
            break;
        case 'date-asc':
            sortedBooks.sort((a, b) =>
                new Date(a.volumeInfo.publishedDate || 0) -
                new Date(b.volumeInfo.publishedDate || 0)
            );
            break;
        case 'date-desc':
            sortedBooks.sort((a, b) =>
                new Date(b.volumeInfo.publishedDate || 0) -
                new Date(a.volumeInfo.publishedDate || 0)
            );
            break;
    }

    renderBooks(sortedBooks);
}

function updatePaginationControls(page) {
    currentPage = page;
    currentPageSpan.textContent = `Page ${page}`;
    prevPageBtn.disabled = page === 1;
    nextPageBtn.disabled = page === totalPages;
}

searchButton.addEventListener('click', filterBooks);
searchInput.addEventListener('input', filterBooks);
sortSelect.addEventListener('change', sortBooks);

listViewBtn.addEventListener('click', () => {
    renderBooks(booksData, 'list');
    listViewBtn.classList.add('active');
    gridViewBtn.classList.remove('active');
});

gridViewBtn.addEventListener('click', () => {
    renderBooks(booksData, 'grid');
    gridViewBtn.classList.add('active');
    listViewBtn.classList.remove('active');
});

prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        fetchBooks(currentPage - 1);
    }
});

nextPageBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
        fetchBooks(currentPage + 1);
    }
});

// Initial fetch
fetchBooks();