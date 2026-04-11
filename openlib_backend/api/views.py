from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.hashers import check_password, make_password
from django.conf import settings
from django.utils import timezone
import os, uuid
from .models import Books, Authors, Categories, Users, BorrowTickets, Publishers, Reviews, Fines
from .serializers import (
    BookSerializer, 
    AuthorSerializer, 
    CategorySerializer, 
    UserSerializer, 
    BorrowTicketSerializer,
    PublisherSerializer,
    ReviewSerializer,
    FineSerializer
)

class UploadImageAPIView(APIView):
    def post(self, request):
        image = request.FILES.get('image')
        if not image:
            return Response({'error': 'Không có file ảnh!'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Tạo thư mục nếu chưa có
        upload_dir = os.path.join(settings.MEDIA_ROOT, 'books_images')
        os.makedirs(upload_dir, exist_ok=True)
        
        # Tạo tên file unique để tránh trùng
        ext = os.path.splitext(image.name)[1]
        filename = f"{uuid.uuid4().hex}{ext}"
        filepath = os.path.join(upload_dir, filename)
        
        # Lưu file
        with open(filepath, 'wb+') as f:
            for chunk in image.chunks():
                f.write(chunk)
        
        # Trả về URL truy cập được
        url = f"http://127.0.0.1:8000{settings.MEDIA_URL}books_images/{filename}"
        return Response({'url': url}, status=status.HTTP_201_CREATED)

# API Quản lý Sách
class BookListAPIView(generics.ListCreateAPIView):
    queryset = Books.objects.all()
    serializer_class = BookSerializer

# API Quản lý Tác giả
class AuthorListAPIView(generics.ListCreateAPIView):
    queryset = Authors.objects.all()
    serializer_class = AuthorSerializer

# API Quản lý Thể loại
class CategoryListAPIView(generics.ListCreateAPIView):
    queryset = Categories.objects.all()
    serializer_class = CategorySerializer

# API Quản lý Thành viên
class UserListAPIView(generics.ListCreateAPIView):
    queryset = Users.objects.all()
    serializer_class = UserSerializer

# API Quản lý Mượn / Trả
class BorrowTicketListAPIView(generics.ListCreateAPIView):
    queryset = BorrowTickets.objects.all()
    serializer_class = BorrowTicketSerializer

# API Quản lý Nhà xuất bản
class PublisherListAPIView(generics.ListCreateAPIView):
    queryset = Publishers.objects.all()
    serializer_class = PublisherSerializer

# API Quản lý Đánh giá
class ReviewListAPIView(generics.ListCreateAPIView):
    queryset = Reviews.objects.all()
    serializer_class = ReviewSerializer

# API Quản lý Phạt
class FineListAPIView(generics.ListCreateAPIView):
    queryset = Fines.objects.all()
    serializer_class = FineSerializer

# --- API ĐĂNG NHẬP / ĐĂNG KÝ ---

class LoginAPIView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        try:
            # Tìm user từ database (table custom)
            user = Users.objects.get(username=username)
            
            # Kiểm tra password (giả sử user đang dùng hash của Django)
            # Nếu user đang dùng plaintext, đổi thành 'if user.password_hash == password:'
            if check_password(password, user.password_hash) or user.password_hash == password:
                # Tạo Token (Vì simplejwt cần object User thật của Django, 
                # ta có thể fix cứng hoặc mock. Nếu table Users không link với Auth User 
                # thì ta tự tạo token bằng tay)
                
                # Để đơn giản và nhanh nhất cho demo, ta trả về thông tin user
                # Trong thực tế, bạn nên dùng JWT thực thụ link với Auth User
                return Response({
                    'message': 'Đăng nhập thành công!',
                    'access': 'fake-jwt-token-for-demo', # Bạn có thể thay bằng JWT thực nếu cấu hình AUTH_USER_MODEL
                    'user': {
                        'username': user.username,
                        'full_name': user.full_name,
                        'role': user.role
                    }
                }, status=status.HTTP_200_OK)
            else:
                return Response({'error': 'Mật khẩu không đúng!'}, status=status.HTTP_401_UNAUTHORIZED)
        except Users.DoesNotExist:
            return Response({'error': 'Tài khoản không tồn tại!'}, status=status.HTTP_404_NOT_FOUND)

class RegisterAPIView(APIView):
    def post(self, request):
        data = request.data
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()
        
        if not username or not password:
            return Response({'error': 'Tên đăng nhập và mật khẩu không được để trống!'}, status=status.HTTP_400_BAD_REQUEST)
        
        if Users.objects.filter(username=username).exists():
            return Response({'error': 'Tên đăng nhập đã tồn tại! Hãy chọn tên khác.'}, status=status.HTTP_400_BAD_REQUEST)
        
        email = data.get('email', '').strip() or None
        if email and Users.objects.filter(email=email).exists():
            return Response({'error': 'Email này đã được sử dụng!'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            from django.db import IntegrityError
            Users.objects.create(
                username=username,
                password_hash=make_password(password),
                full_name=data.get('full_name', username),
                email=email,
                role='Member',
                is_active=True
            )
            return Response({'message': 'Đăng ký thành công!'}, status=status.HTTP_201_CREATED)
        except IntegrityError as e:
            return Response({'error': 'Dữ liệu bị trùng. Hãy kiểm tra lại tên đăng nhập hoặc email.'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': f'Lỗi server: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --- API CHI TIẾT (UPDATE / DELETE) ---

class BookDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Books.objects.all()
    serializer_class = BookSerializer
    lookup_field = 'book_id'

class AuthorDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Authors.objects.all()
    serializer_class = AuthorSerializer
    lookup_field = 'author_id'

class CategoryDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Categories.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'category_id'

class UserDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Users.objects.all()
    serializer_class = UserSerializer
    lookup_field = 'user_id'

class BorrowTicketDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = BorrowTickets.objects.all()
    serializer_class = BorrowTicketSerializer
    lookup_field = 'ticket_id'

class PublisherDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Publishers.objects.all()
    serializer_class = PublisherSerializer
    lookup_field = 'publisher_id'

class ReviewDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Reviews.objects.all()
    serializer_class = ReviewSerializer
    lookup_field = 'review_id'

class FineDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Fines.objects.all()
    serializer_class = FineSerializer
    lookup_field = 'fine_id'
# ─────────────────────────────────────────────────────────────
# BORROW REQUEST: Người dùng gửi yêu cầu mượn sách (status='pending')
# ─────────────────────────────────────────────────────────────
class BorrowRequestAPIView(APIView):
    def get(self, request):
        """Admin lấy danh sách yêu cầu pending"""
        tickets = BorrowTickets.objects.filter(status='pending').order_by('-ticket_id')
        data = []
        for t in tickets:
            data.append({
                'ticket_id': t.ticket_id,
                'member_id': t.member_id,
                'member_name': t.member.full_name if t.member else '—',
                'member_username': t.member.username if t.member else '—',
                'borrow_date': str(t.borrow_date),
                'status': t.status,
                'books': [
                    {
                        'book_id': d.book_id,
                        'title': d.book.title if d.book else '—',
                        'due_date': str(d.due_date),
                    }
                    for d in t.borrowticketdetails_set.all()
                ]
            })
        return Response(data)

    def post(self, request):
        """Người dùng gửi yêu cầu mượn"""
        username = request.data.get('username')
        book_id = request.data.get('book_id')
        if not username or not book_id:
            return Response({'error': 'Thiếu thông tin username hoặc book_id'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            member = Users.objects.get(username=username)
        except Users.DoesNotExist:
            return Response({'error': 'Người dùng không tồn tại'}, status=status.HTTP_404_NOT_FOUND)
        try:
            book = Books.objects.get(book_id=book_id)
        except Books.DoesNotExist:
            return Response({'error': 'Sách không tồn tại'}, status=status.HTTP_404_NOT_FOUND)
        if book.stock is not None and book.stock <= 0:
            return Response({'error': 'Sách đã hết, không thể tạo yêu cầu mượn'}, status=status.HTTP_400_BAD_REQUEST)
        # Kiểm tra duplicate pending request
        existing = BorrowTickets.objects.filter(member=member, status='pending')
        for ex in existing:
            if ex.borrowticketdetails_set.filter(book=book).exists():
                return Response({'error': 'Bạn đã có yêu cầu mượn sách này đang chờ duyệt'}, status=status.HTTP_400_BAD_REQUEST)
        from datetime import date, timedelta
        ticket = BorrowTickets.objects.create(
            member=member,
            librarian=None,
            borrow_date=date.today(),
            status='pending'
        )
        due = date.today() + timedelta(days=14)
        BorrowTicketDetails.objects.create(ticket=ticket, book=book, due_date=due, is_returned=False)
        return Response({
            'message': f'Yêu cầu mượn sách "{book.title}" đã được gửi! Vui lòng chờ thủ thư duyệt.',
            'ticket_id': ticket.ticket_id,
            'status': 'pending'
        }, status=status.HTTP_201_CREATED)


class BorrowApproveAPIView(APIView):
    """Admin duyệt hoặc từ chối yêu cầu mượn"""
    def patch(self, request, ticket_id):
        action = request.data.get('action')  # 'approve' or 'reject'
        librarian_username = request.data.get('librarian_username', '')
        if action not in ('approve', 'reject'):
            return Response({'error': 'action phải là approve hoặc reject'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            ticket = BorrowTickets.objects.get(ticket_id=ticket_id, status='pending')
        except BorrowTickets.DoesNotExist:
            return Response({'error': 'Không tìm thấy yêu cầu hoặc đã xử lý'}, status=status.HTTP_404_NOT_FOUND)
        librarian = None
        if librarian_username:
            try:
                librarian = Users.objects.get(username=librarian_username)
            except Users.DoesNotExist:
                pass
        if action == 'approve':
            ticket.status = 'active'
            ticket.librarian = librarian
            ticket.save()
            for detail in ticket.borrowticketdetails_set.all():
                if detail.book and detail.book.stock and detail.book.stock > 0:
                    detail.book.stock -= 1
                    detail.book.save()
            return Response({'message': 'Yêu cầu đã được DUYỆT ✓', 'ticket_id': ticket_id, 'status': 'active'})
        else:
            ticket.status = 'rejected'
            ticket.save()
            return Response({'message': 'Yêu cầu đã bị TỪ CHỐI ✗', 'ticket_id': ticket_id, 'status': 'rejected'})
