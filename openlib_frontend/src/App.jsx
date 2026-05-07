import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout';
import Dashboard from './Dashboard';
import Login from './Login';
import EditPage from './EditPage';
import DetailPage from './DetailPage';
import AddPage from './AddPage';
import PublicPage from './PublicPage';
import BookDetailPage from './BookDetailPage';
import './App.css';

function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const tabsConfig = {
    dashboard: { label: 'Tổng quan', url: 'books/' },
    books: { label: 'Quản lý Sách', url: 'books/' },
    authors: { label: 'Tác giả', url: 'authors/' },
    categories: { label: 'Thể loại', url: 'categories/' },
    members: { label: 'Thành viên', url: 'users/' },
    borrow: { label: 'Mượn / Trả', url: 'borrow_tickets/' },
    borrow_requests: { label: 'Yêu cầu mượn', url: 'borrow_request/' },
    publishers: { label: 'Nhà xuất bản', url: 'publishers/' },
    reviews: { label: 'Đánh giá', url: 'reviews/' },
    fines: { label: 'Phạt vi phạm', url: 'fines/' }
  };

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        if (user) {
          setCurrentUser(user);
          setIsAuth(true);
        }
      }
    } catch (e) {
      console.error("Auth init error:", e);
      localStorage.clear();
      setIsAuth(false);
    }
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setIsAuth(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setIsAuth(false);
    setCurrentUser(null);
  };

  return (
    <Router>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<PublicPage user={currentUser} onLogout={handleLogout} />} />
        <Route path="/books/:bookId" element={<BookDetailPage user={currentUser} />} />
        
        {/* LOGIN / REGISTER Toggled Screen */}
        <Route path="/login" element={isAuth ? <Navigate to="/" /> : <Login onLoginSuccess={handleLoginSuccess} />} />
        
        {/* ADMIN ROUTES */}
        <Route path="/admin/*" element={
          isAuth ? (
             (currentUser?.role?.toLowerCase() === 'admin' || currentUser?.role?.toLowerCase() === 'librarian') ? (
            <Layout user={currentUser} onLogout={handleLogout}>
              <Routes>
                <Route path="/" element={<Dashboard activeTab="dashboard" tabs={tabsConfig} />} />
                <Route path="books" element={<Dashboard activeTab="books" tabs={tabsConfig} />} />
                <Route path="authors" element={<Dashboard activeTab="authors" tabs={tabsConfig} />} />
                <Route path="categories" element={<Dashboard activeTab="categories" tabs={tabsConfig} />} />
                <Route path="members" element={<Dashboard activeTab="members" tabs={tabsConfig} />} />
                <Route path="borrow" element={<Dashboard activeTab="borrow" tabs={tabsConfig} />} />
                <Route path="borrow_requests" element={<Dashboard activeTab="borrow_requests" tabs={tabsConfig} />} />
                <Route path="publishers" element={<Dashboard activeTab="publishers" tabs={tabsConfig} />} />
                <Route path="reviews" element={<Dashboard activeTab="reviews" tabs={tabsConfig} />} />
                <Route path="fines" element={<Dashboard activeTab="fines" tabs={tabsConfig} />} />
                
                <Route path=":type/detail/:id" element={<DetailPage />} />
                <Route path=":type/edit/:id" element={<EditPage />} />
                <Route path=":type/add" element={<AddPage />} />
                <Route path="*" element={<Navigate to="/admin" />} />
              </Routes>
            </Layout>
            ) : <Navigate to="/" />
          ) : <Navigate to="/login" />
        } />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
