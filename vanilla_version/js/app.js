const API_URL = 'http://127.0.0.1:8000/api/books/';

function fetchAndDisplayBooks() {
    fetch(API_URL)
        .then(response => {
            if (!response.ok) throw new Error('Không thể kết nối tới Backend API');
            return response.json();
        })
        .then(data => {
            const tbody = document.getElementById('book-list-body');
            tbody.innerHTML = ''; 

            data.forEach(book => {
                let stockBadgeClass = book.stock > 0 ? 'status-badge' : 'status-badge out-of-stock';
                const row = `
                    <tr>
                        <td>#${book.book_id}</td>
                        <td><strong>${book.title}</strong></td>
                        <td>${book.isbn || 'Chưa cập nhật'}</td>
                        <td>${book.publication_year || 'N/A'}</td>
                        <td><span class="${stockBadgeClass}">${book.stock} cuốn</span></td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
        })
        .catch(error => {
            console.error('Lỗi:', error);
            document.getElementById('book-list-body').innerHTML = `<tr><td colspan="5" style="color:red; text-align:center;">❌ Lỗi: Backend Django chưa chạy hoặc bị lỗi CORS.</td></tr>`;
        });
}

window.onload = fetchAndDisplayBooks;