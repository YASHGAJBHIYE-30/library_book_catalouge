// Constants
const MAX_BOOKS = 50;

// Gradients array for random book covers (aesthetic touch)
const coverGradients = [
    'linear-gradient(135deg, #7F7AFA 0%, #6C63FF 100%)',
    'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%)',
    'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)',
    'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)',
    'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
    'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)'
];

// State
let books = [];

// DOM Elements
const bookGrid = document.getElementById('book-grid');
const emptyState = document.getElementById('empty-state');
const libraryStats = document.getElementById('library-stats');
const searchInput = document.getElementById('search-input');
const addBookForm = document.getElementById('add-book-form');
const addBookSection = document.getElementById('add-book-section');
const navAddBookBtn = document.getElementById('nav-add-book');
const closeAddBookBtn = document.getElementById('close-add-book');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');
const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.getElementById('sidebar');

// Initialization
function init() {
    loadBooks();
    setupEventListeners();
    
    // Add some initial data if empty to show the design immediately
    if (books.length === 0) {
        addInitialMockData();
    } else {
        displayBooks();
    }
}

// Add Mock Data for presentation based on constraints provided
function addInitialMockData() {
    const mockData = [
        { id: generateId(), title: "The Psychology of Money", author: "Morgan Housel", year: 2020, coverUrl: "C:/Users/Asus/.gemini/antigravity/brain/6143b83a-2610-4a33-94df-dc680d901182/psychology_cover_1775107277122.png" },
        { id: generateId(), title: "Company of One", author: "Paul Jarvis", year: 2019, coverUrl: "C:/Users/Asus/.gemini/antigravity/brain/6143b83a-2610-4a33-94df-dc680d901182/company_one_cover_1775107299913.png" },
        { id: generateId(), title: "How Innovation Works", author: "Matt Ridley", year: 2020, coverUrl: "C:/Users/Asus/.gemini/antigravity/brain/6143b83a-2610-4a33-94df-dc680d901182/innovation_works_cover_1775107408695.png" },
        { id: generateId(), title: "The Picture of Dorian Gray", author: "Oscar Wilde", year: 1890, coverUrl: "C:/Users/Asus/.gemini/antigravity/brain/6143b83a-2610-4a33-94df-dc680d901182/dorian_gray_cover_1775107504629.png" },
        { id: generateId(), title: "The Two Towers", author: "J.R.R. Tolkien", year: 1954, coverUrl: "C:/Users/Asus/.gemini/antigravity/brain/6143b83a-2610-4a33-94df-dc680d901182/two_towers_cover_1775107525457.png" }
    ];
    books = mockData;
    saveBooks();
    displayBooks();
}

// Core Functions
function loadBooks() {
    const saved = localStorage.getItem('library_dashboard_books');
    if (saved) {
        books = JSON.parse(saved);
    }
}

function saveBooks() {
    localStorage.setItem('library_dashboard_books', JSON.stringify(books));
}

function displayBooks(booksToDisplay = books) {
    // Clear current grid
    bookGrid.innerHTML = '';
    
    // Update Stats
    libraryStats.textContent = `${books.length} / ${MAX_BOOKS} Books`;

    // Handle Empty State
    if (booksToDisplay.length === 0) {
        emptyState.classList.add('visible');
        return;
    } else {
        emptyState.classList.remove('visible');
    }

    // Render Books
    booksToDisplay.forEach((book, index) => {
        const card = createBookCard(book, index);
        bookGrid.appendChild(card);
    });
}

function createBookCard(book, index) {
    const card = document.createElement('div');
    card.classList.add('book-card');
    
    // Stagger animation delay
    card.style.animationDelay = `${(index % 10) * 0.05}s`;
    
    // Select stable gradient based on ID
    const gradientIndex = book.id % coverGradients.length;
    const gradient = coverGradients[gradientIndex];
    
    let coverStyle = `background: ${gradient};`;
    let coverHtml = `
        <div class="book-cover-title">${book.title}</div>
        <div class="book-cover-author">${book.author}</div>
    `;

    if (book.coverUrl) {
        coverStyle = `background-image: url('${book.coverUrl}'); background-size: cover; background-position: center;`;
        coverHtml = ``; // Hide text if we have a real cover image
    }

    card.innerHTML = `
        <div class="book-cover" style="${coverStyle}">
            ${coverHtml}
        </div>
        <div class="book-info">
            <div class="book-details">
                <div class="book-title" title="${book.title}">${book.title}</div>
                <div class="book-author-year">${book.author} • ${book.year}</div>
            </div>
            <button class="delete-btn" onclick="removeBook(${book.id})" title="Remove Book">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        </div>
    `;
    
    return card;
}

function addBook(title, author, year) {
    if (books.length >= MAX_BOOKS) {
        showToast('Library is full! Maximum 50 books allowed.', true);
        return;
    }

    const newBook = {
        id: generateId(),
        title: title.trim(),
        author: author.trim(),
        year: parseInt(year)
    };

    // Prepend to show newest first
    books.unshift(newBook);
    saveBooks();
    displayBooks();
    showToast('Book added successfully!');
    
    // Reset form & hide section
    addBookForm.reset();
    addBookSection.classList.add('hidden');
    
    // Switch active nav to Dashboard
    updateActiveNav(document.querySelector('.nav-item:first-child'));
}

// Global scope for onclick attribute in HTML
window.removeBook = function(id) {
    if(confirm('Are you sure you want to remove this book?')) {
        books = books.filter(book => book.id !== id);
        saveBooks();
        displayBooks();
        showToast('Book removed from library');
        
        // Re-run search if active
        if(searchInput.value) {
            searchBook(searchInput.value);
        }
    }
}

function searchBook(query) {
    if (!query.trim()) {
        displayBooks();
        return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = books.filter(book => 
        book.title.toLowerCase().includes(lowerQuery) || 
        book.author.toLowerCase().includes(lowerQuery) ||
        book.year.toString().includes(lowerQuery)
    );
    
    displayBooks(filtered);
    
    if (filtered.length === 0) {
        emptyState.querySelector('h3').textContent = 'No book found';
        emptyState.querySelector('p').textContent = `No matches for "${query}"`;
    } else {
        emptyState.querySelector('h3').textContent = 'No books yet';
        emptyState.querySelector('p').textContent = 'Your library is empty. Start adding some books!';
    }
}

// Utility Functions
function generateId() {
    return Math.floor(Math.random() * 1000000);
}

function showToast(message, isError = false) {
    toastMessage.textContent = message;
    
    if (isError) {
        toast.classList.add('error');
        toast.querySelector('i').className = 'fa-solid fa-circle-exclamation';
    } else {
        toast.classList.remove('error');
        toast.querySelector('i').className = 'fa-solid fa-circle-check';
    }
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function updateActiveNav(targetItem) {
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    targetItem.classList.add('active');
}

// Event Listeners
function setupEventListeners() {
    // Form Submit
    addBookForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('book-title').value;
        const author = document.getElementById('book-author').value;
        const year = document.getElementById('book-year').value;
        
        if (title && author && year) {
            addBook(title, author, year);
        } else {
            showToast('Please fill all fields', true);
        }
    });

    // Search Input Real-time
    searchInput.addEventListener('input', (e) => {
        searchBook(e.target.value);
    });

    // Add Book Toggle
    navAddBookBtn.addEventListener('click', (e) => {
        e.preventDefault();
        addBookSection.classList.remove('hidden');
        document.getElementById('book-title').focus();
        
        updateActiveNav(navAddBookBtn.closest('.nav-item'));
        
        // Auto scroll to it
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    closeAddBookBtn.addEventListener('click', () => {
        addBookSection.classList.add('hidden');
        updateActiveNav(document.querySelector('.nav-item:first-child'));
    });
    
    // Other Nav link handling just for visuals
    document.querySelectorAll('.nav-link').forEach(link => {
        if(link !== navAddBookBtn && !link.closest('.nav-item').classList.contains('active')) {
            link.addEventListener('click', function(e) {
                // Prevent default if href is #
                if(this.getAttribute('href') === '#' || this.getAttribute('href').startsWith('#')) {
                    e.preventDefault();
                }
                updateActiveNav(this.closest('.nav-item'));
            });
        }
    });

    // Mobile Sidebar Toggle
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && 
            sidebar.classList.contains('open') && 
            !sidebar.contains(e.target) && 
            e.target !== menuToggle && 
            !menuToggle.contains(e.target)) {
            sidebar.classList.remove('open');
        }
    });
}

// Run app
document.addEventListener('DOMContentLoaded', init);
