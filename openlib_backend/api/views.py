from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.hashers import check_password, make_password
from django.conf import settings
from django.utils import timezone
import os, uuid
from .models import Books, Authors, Categories, Users, BorrowTickets, BorrowTicketDetails, Publishers, Reviews, Fines
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
        upload_dir = os.path.join(settings.MEDIA_ROOT, 'books_images')
        os.makedirs(upload_dir, exist_ok=True)
        ext = os.path.splitext(image.name)[1]
        filename = f"{uuid.uuid4().hex}{ext}"
        filepath = os.path.join(upload_dir, filename)
        with open(filepath, 'wb+') as f:
            for chunk in image.chunks():
                f.write(chunk)
        url = f"http://127.0.0.1:8000{settings.MEDIA_URL}books_images/{filename}"
        return Response({'url': url}, status=status.HTTP_201_CREATED)

# ─── LIST / CREATE ───────────────────────────────────────────
class BookListAPIView(generics.ListCreateAPIView):
    queryset = Books.objects.all()
    serializer_class = BookSerializer

class AuthorListAPIView(generics.ListCreateAPIView):
    queryset = Authors.objects.all()
    serializer_class = AuthorSerializer

class CategoryListAPIView(generics.ListCreateAPIView):
    queryset = Categories.objects.all()
    serializer_class = CategorySerializer

class UserListAPIView(generics.ListCreateAPIView):
    queryset = Users.objects.all()
    serializer_class = UserSerializer

class BorrowTicketListAPIView(generics.ListCreateAPIView):
    queryset = BorrowTickets.objects.all()
    serializer_class = BorrowTicketSerializer

class PublisherListAPIView(generics.ListCreateAPIView):
    queryset = Publishers.objects.all()
    serializer_class = PublisherSerializer

class ReviewListAPIView(generics.ListCreateAPIView):
    queryset = Reviews.objects.all()
    serializer_class = ReviewSerializer

class FineListAPIView(generics.ListCreateAPIView):
    queryset = Fines.objects.all()
    serializer_class = FineSerializer

# ─── AUTH ────────────────────────────────────────────────────
class LoginAPIView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        try:
            user = Users.objects.get(username=username)
            if check_password(password, user.password_hash) or user.password_hash == password:
                return Response({
                    'message': 'Đăng nhập thành công!',
                    'access': 'fake-jwt-token-for-demo',
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
        except IntegrityError:
            return Response({'error': 'Dữ liệu bị trùng. Hãy kiểm tra lại tên đăng nhập hoặc email.'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': f'Lỗi server: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ─── DETAIL / UPDATE / DELETE ────────────────────────────────
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
# BORROW REQUEST — Yêu cầu mượn sách
# GET  /api/borrow_request/?status=pending|active|rejected|returned|completed|overdue|all
# POST /api/borrow_request/  → tạo yêu cầu mới
# ─────────────────────────────────────────────────────────────

# PostgreSQL ENUM values: 'Active', 'Completed', 'Overdue', 'Pending', 'Rejected', 'Returned'
# Mapping frontend tab keys → exact DB ENUM values
STATUS_MAP = {
    'pending':  ['Pending'],
    'active':   ['Active'],
    'rejected': ['Rejected'],
    'returned': ['Returned', 'Completed'],
    'overdue':  ['Overdue'],
}

def _build_ticket_data(t):
    """Serialize một BorrowTicket thành dict cho API response."""
    books_data = []
    try:
        for d in t.borrowticketdetails_set.all():
            try:
                books_data.append({
                    'book_id': d.book_id,
                    'title': d.book.title if d.book else '—',
                    'due_date': str(d.due_date),
                    'return_date': str(d.return_date) if d.return_date else None,
                    'is_returned': d.is_returned,
                })
            except Exception:
                continue
    except Exception:
        pass
    return {
        'ticket_id': t.ticket_id,
        'member_id': t.member_id,
        'member_name': t.member.full_name if t.member else '—',
        'member_username': t.member.username if t.member else '—',
        'librarian_name': t.librarian.full_name if t.librarian else None,
        'borrow_date': str(t.borrow_date),
        'status': t.status,
        'books': books_data,
    }


class BorrowRequestAPIView(APIView):

    def get(self, request):
        """Admin lấy danh sách yêu cầu theo status."""
        status_filter = request.GET.get('status', 'pending')
        try:
            if status_filter == 'all':
                tickets = BorrowTickets.objects.all().order_by('-ticket_id')
            elif status_filter in STATUS_MAP:
                tickets = BorrowTickets.objects.filter(
                    status__in=STATUS_MAP[status_filter]
                ).order_by('-ticket_id')
            else:
                tickets = BorrowTickets.objects.filter(
                    status__iexact=status_filter
                ).order_by('-ticket_id')

            data = []
            for t in tickets:
                try:
                    data.append(_build_ticket_data(t))
                except Exception:
                    continue
            return Response(data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        """Người dùng gửi yêu cầu mượn sách."""
        username = request.data.get('username')
        book_id  = request.data.get('book_id')
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
        existing = BorrowTickets.objects.filter(member=member, status='Pending')
        for ex in existing:
            if ex.borrowticketdetails_set.filter(book=book).exists():
                return Response({'error': 'Bạn đã có yêu cầu mượn sách này đang chờ duyệt'}, status=status.HTTP_400_BAD_REQUEST)
        from datetime import date, timedelta
        ticket = BorrowTickets.objects.create(
            member=member,
            librarian=None,
            borrow_date=date.today(),
            status='Pending'
        )
        due = date.today() + timedelta(days=14)
        BorrowTicketDetails.objects.create(ticket=ticket, book=book, due_date=due, is_returned=False)
        return Response({
            'message': f'Yêu cầu mượn sách "{book.title}" đã được gửi! Vui lòng chờ thủ thư duyệt.',
            'ticket_id': ticket.ticket_id,
            'status': 'pending'
        }, status=status.HTTP_201_CREATED)


# ─────────────────────────────────────────────────────────────
# BORROW APPROVE — Admin duyệt hoặc từ chối yêu cầu
# PATCH /api/borrow_request/<ticket_id>/approve/
# ─────────────────────────────────────────────────────────────
class BorrowApproveAPIView(APIView):
    """Admin duyệt hoặc từ chối yêu cầu mượn."""
    def patch(self, request, ticket_id):
        action = request.data.get('action')  # 'approve' or 'reject'
        librarian_username = request.data.get('librarian_username', '')
        if action not in ('approve', 'reject'):
            return Response({'error': 'action phải là approve hoặc reject'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            # Tìm ticket đang ở trạng thái pending (bao gồm các variant chữ hoa/thường)
            ticket = BorrowTickets.objects.filter(
                ticket_id=ticket_id,
                status='Pending'
            ).first()
            if not ticket:
                return Response({'error': 'Không tìm thấy yêu cầu hoặc đã được xử lý'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        librarian = None
        if librarian_username:
            try:
                librarian = Users.objects.get(username=librarian_username)
            except Users.DoesNotExist:
                pass

        if action == 'approve':
            ticket.status = 'Active'
            ticket.librarian = librarian
            ticket.save()
            for detail in ticket.borrowticketdetails_set.all():
                try:
                    if detail.book and detail.book.stock and detail.book.stock > 0:
                        detail.book.stock -= 1
                        detail.book.save()
                except Exception:
                    continue
            return Response({'message': 'Yêu cầu đã được DUYỆT ✓', 'ticket_id': ticket_id, 'status': 'active'})
        else:
            ticket.status = 'Rejected'
            ticket.save()
            return Response({'message': 'Yêu cầu đã bị TỪ CHỐI ✗', 'ticket_id': ticket_id, 'status': 'rejected'})
