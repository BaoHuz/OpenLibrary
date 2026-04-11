from django.urls import path
from .views import (
    BookListAPIView, BookDetailAPIView,
    AuthorListAPIView, AuthorDetailAPIView,
    CategoryListAPIView, CategoryDetailAPIView,
    UserListAPIView, UserDetailAPIView,
    BorrowTicketListAPIView, BorrowTicketDetailAPIView,
    BorrowRequestAPIView, BorrowApproveAPIView,
    LoginAPIView,
    RegisterAPIView,
    PublisherListAPIView, PublisherDetailAPIView,
    ReviewListAPIView, ReviewDetailAPIView,
    FineListAPIView, FineDetailAPIView,
    UploadImageAPIView,
)

urlpatterns = [
    # List and Create
    path('books/', BookListAPIView.as_view(), name='book-list'),
    path('authors/', AuthorListAPIView.as_view(), name='author-list'),
    path('categories/', CategoryListAPIView.as_view(), name='category-list'),
    path('users/', UserListAPIView.as_view(), name='user-list'),
    path('borrow_tickets/', BorrowTicketListAPIView.as_view(), name='borrow-ticket-list'),
    path('publishers/', PublisherListAPIView.as_view(), name='publisher-list'),
    path('reviews/', ReviewListAPIView.as_view(), name='review-list'),
    path('fines/', FineListAPIView.as_view(), name='fine-list'),
    
    # Detail (Update/Delete)
    path('books/<int:book_id>/', BookDetailAPIView.as_view(), name='book-detail'),
    path('authors/<int:author_id>/', AuthorDetailAPIView.as_view(), name='author-detail'),
    path('categories/<int:category_id>/', CategoryDetailAPIView.as_view(), name='category-detail'),
    path('users/<int:user_id>/', UserDetailAPIView.as_view(), name='user-detail'),
    path('borrow_tickets/<int:ticket_id>/', BorrowTicketDetailAPIView.as_view(), name='borrow-ticket-detail'),
    path('publishers/<int:publisher_id>/', PublisherDetailAPIView.as_view(), name='publisher-detail'),
    path('reviews/<int:review_id>/', ReviewDetailAPIView.as_view(), name='review-detail'),
    path('fines/<int:fine_id>/', FineDetailAPIView.as_view(), name='fine-detail'),

    # Auth
    path('login/', LoginAPIView.as_view(), name='login'),
    path('register/', RegisterAPIView.as_view(), name='register'),

    # Upload
    path('upload-image/', UploadImageAPIView.as_view(), name='upload-image'),

    # Borrow Request (Public user → Admin)
    path('borrow_request/', BorrowRequestAPIView.as_view(), name='borrow-request'),
    path('borrow_request/<int:ticket_id>/approve/', BorrowApproveAPIView.as_view(), name='borrow-approve'),
]