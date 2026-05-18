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

    def create(self, request, *args, **kwargs):
        isbn = request.data.get('isbn')
        try:
            stock_to_add = int(request.data.get('stock', 0))
        except ValueError:
            stock_to_add = 0

        if isbn:
            existing_book = Books.objects.filter(isbn=isbn).first()
            if existing_book:
                existing_book.stock = (existing_book.stock or 0) + stock_to_add
                existing_book.save()
                serializer = self.get_serializer(existing_book)
                return Response(serializer.data, status=status.HTTP_200_OK)

        return super().create(request, *args, **kwargs)

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
    serializer_class = BorrowTicketSerializer

    def get_queryset(self):
        _auto_update_overdue_tickets()
        return BorrowTickets.objects.all().order_by('-ticket_id')

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
            if user.is_active is False:
                return Response({'error': 'Tài khoản của bạn đã bị khóa! Vui lòng liên hệ Admin.'}, status=status.HTTP_403_FORBIDDEN)
            if check_password(password, user.password_hash) or user.password_hash == password:
                return Response({
                    'message': 'Đăng nhập thành công!',
                    'access': 'fake-jwt-token-for-demo',
                    'user': {
                        'user_id': user.user_id,
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
    serializer_class = BorrowTicketSerializer
    lookup_field = 'ticket_id'

    def get_queryset(self):
        _auto_update_overdue_tickets()
        return BorrowTickets.objects.all()

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

def _auto_update_overdue_tickets():
    """Tự động quét và cập nhật trạng thái các phiếu mượn Active đã quá hạn sang Overdue."""
    from datetime import date
    try:
        today = date.today()
        # Lấy tất cả các phiếu đang Active có ít nhất một cuốn sách quá hạn chưa trả
        overdue_tickets = BorrowTickets.objects.filter(
            status='Active',
            borrowticketdetails__is_returned=False,
            borrowticketdetails__due_date__lt=today
        ).distinct()
        for ticket in overdue_tickets:
            ticket.status = 'Overdue'
            ticket.save()
    except Exception:
        pass

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
                    'quantity': getattr(d, 'quantity', 1) or 1,
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
        username = request.GET.get('username')
        status_filter = request.GET.get('status', 'all')
        try:
            _auto_update_overdue_tickets()
            tickets = BorrowTickets.objects.all()
            if username:
                tickets = tickets.filter(member__username=username)
            if status_filter == 'all':
                tickets = tickets.order_by('-ticket_id')
            elif status_filter in STATUS_MAP:
                tickets = tickets.filter(
                    status__in=STATUS_MAP[status_filter]
                ).order_by('-ticket_id')
            else:
                tickets = tickets.filter(
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
        book_ids = request.data.get('book_ids')
        items    = request.data.get('items')
        
        if not username:
            return Response({'error': 'Thiếu thông tin username'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            member = Users.objects.get(username=username)
        except Users.DoesNotExist:
            return Response({'error': 'Người dùng không tồn tại'}, status=status.HTTP_404_NOT_FOUND)

        target_items = []  # [{book: BookModel, quantity: int}]
        
        if items:
            if isinstance(items, list):
                for item in items:
                    b_id = item.get('book_id')
                    qty = int(item.get('quantity', 1))
                    if b_id and qty > 0:
                        try:
                            book_obj = Books.objects.get(book_id=b_id)
                            target_items.append({'book': book_obj, 'quantity': qty})
                        except Books.DoesNotExist:
                            return Response({'error': f'Sách ID {b_id} không tồn tại'}, status=status.HTTP_404_NOT_FOUND)
        else:
            fallback_ids = []
            if book_id:
                fallback_ids.append(book_id)
            if book_ids:
                if isinstance(book_ids, list):
                    fallback_ids.extend(book_ids)
                else:
                    try:
                        import json
                        parsed = json.loads(book_ids)
                        if isinstance(parsed, list):
                            fallback_ids.extend(parsed)
                    except Exception:
                        pass
            
            seen = set()
            fallback_ids = [x for x in fallback_ids if not (x in seen or seen.add(x))]
            for b_id in fallback_ids:
                try:
                    book_obj = Books.objects.get(book_id=b_id)
                    target_items.append({'book': book_obj, 'quantity': 1})
                except Books.DoesNotExist:
                    return Response({'error': f'Sách ID {b_id} không tồn tại'}, status=status.HTTP_404_NOT_FOUND)

        if not target_items:
            return Response({'error': 'Thiếu thông tin sách để tạo yêu cầu mượn'}, status=status.HTTP_400_BAD_REQUEST)

        # Check stock and duplicate pending requests
        existing_tickets = BorrowTickets.objects.filter(member=member, status='Pending')
        for t_item in target_items:
            book_obj = t_item['book']
            qty = t_item['quantity']
            
            if book_obj.stock is not None and book_obj.stock < qty:
                return Response({'error': f'Sách "{book_obj.title}" không đủ tồn kho (còn {book_obj.stock} cuốn)'}, status=status.HTTP_400_BAD_REQUEST)
                
            for ex in existing_tickets:
                if ex.borrowticketdetails_set.filter(book=book_obj).exists():
                    return Response({'error': f'Bạn đã có yêu cầu mượn sách "{book_obj.title}" đang chờ duyệt'}, status=status.HTTP_400_BAD_REQUEST)

        from datetime import date, timedelta
        from django.db import transaction
        try:
            with transaction.atomic():
                ticket = BorrowTickets.objects.create(
                    member=member,
                    librarian=None,
                    borrow_date=date.today(),
                    status='Pending'
                )
                due = date.today() + timedelta(days=14)
                for t_item in target_items:
                    BorrowTicketDetails.objects.create(
                        ticket=ticket, 
                        book=t_item['book'], 
                        due_date=due, 
                        is_returned=False,
                        quantity=t_item['quantity']
                    )

            book_titles_str = ", ".join([f'"{ti["book"].title}" (SL: {ti["quantity"]})' for ti in target_items])
            return Response({
                'message': f'Yêu cầu mượn các sách: {book_titles_str} đã được gửi thành công!',
                'ticket_id': ticket.ticket_id,
                'status': 'Pending'
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': f'Lỗi hệ thống: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        '''
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
        '''

    def put(self, request, ticket_id=None):
        """Admin chỉnh sửa số lượng hoặc sách trong yêu cầu mượn."""
        if not ticket_id:
            return Response({'error': 'Thiếu ticket_id'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            ticket = BorrowTickets.objects.get(ticket_id=ticket_id)
        except BorrowTickets.DoesNotExist:
            return Response({'error': 'Không tìm thấy phiếu mượn'}, status=status.HTTP_404_NOT_FOUND)

        if ticket.status != 'Pending':
            return Response({'error': 'Chỉ có thể chỉnh sửa yêu cầu ở trạng thái Chờ duyệt (Pending)'}, status=status.HTTP_400_BAD_REQUEST)

        items = request.data.get('items')
        if not items or not isinstance(items, list):
            return Response({'error': 'Danh sách sách items không hợp lệ'}, status=status.HTTP_400_BAD_REQUEST)

        parsed_items = []
        for item in items:
            b_id = item.get('book_id')
            qty = int(item.get('quantity', 1))
            if qty <= 0:
                continue
            try:
                book = Books.objects.get(book_id=b_id)
            except Books.DoesNotExist:
                return Response({'error': f'Sách ID {b_id} không tồn tại'}, status=status.HTTP_404_NOT_FOUND)
            
            if book.stock is not None and book.stock < qty:
                return Response({'error': f'Sách "{book.title}" không đủ tồn kho (còn {book.stock} cuốn)'}, status=status.HTTP_400_BAD_REQUEST)
            
            parsed_items.append({'book': book, 'quantity': qty})

        if not parsed_items:
            return Response({'error': 'Phiếu mượn phải chứa ít nhất 1 cuốn sách hợp lệ'}, status=status.HTTP_400_BAD_REQUEST)

        from django.db import transaction
        try:
            with transaction.atomic():
                ticket.borrowticketdetails_set.all().delete()
                from datetime import date, timedelta
                due = date.today() + timedelta(days=14)
                for p in parsed_items:
                    BorrowTicketDetails.objects.create(
                        ticket=ticket,
                        book=p['book'],
                        due_date=due,
                        is_returned=False,
                        quantity=p['quantity']
                    )
            return Response({'message': 'Cập nhật yêu cầu mượn thành công!', 'ticket_id': ticket_id})
        except Exception as e:
            return Response({'error': f'Lỗi hệ thống: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, ticket_id=None):
        """Hủy yêu cầu mượn sách đang ở trạng thái Chờ duyệt (Pending)."""
        if not ticket_id:
            ticket_id = request.data.get('ticket_id') or request.GET.get('ticket_id')

        if not ticket_id:
            return Response({'error': 'Thiếu thông tin ticket_id'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            ticket = BorrowTickets.objects.get(ticket_id=ticket_id)
        except BorrowTickets.DoesNotExist:
            return Response({'error': 'Không tìm thấy phiếu mượn'}, status=status.HTTP_404_NOT_FOUND)

        if ticket.status != 'Pending':
            return Response({'error': 'Chỉ có thể hủy yêu cầu mượn ở trạng thái Chờ duyệt (Pending)'}, status=status.HTTP_400_BAD_REQUEST)

        from django.db import transaction
        try:
            with transaction.atomic():
                BorrowTicketDetails.objects.filter(ticket=ticket).delete()
                ticket.delete()
            return Response({'message': 'Đã hủy yêu cầu mượn sách thành công!'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': f'Lỗi khi hủy: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
                    if detail.book and detail.book.stock is not None:
                        qty = getattr(detail, 'quantity', 1) or 1
                        detail.book.stock = max(0, detail.book.stock - qty)
                        detail.book.save()
                except Exception:
                    continue
            return Response({'message': 'Yêu cầu đã được DUYỆT ✓', 'ticket_id': ticket_id, 'status': 'active'})
        else:
            ticket.status = 'Rejected'
            ticket.save()
            return Response({'message': 'Yêu cầu đã bị TỪ CHỐI ✗', 'ticket_id': ticket_id, 'status': 'rejected'})
# POST /api/export/ → Tạo phiếu xuất kho mới
# ─────────────────────────────────────────────────────────────
from .models import ExportTickets, ExportTicketDetails
from .serializers import ExportTicketSerializer

class ExportAPIView(APIView):
    def get(self, request):
        tickets = ExportTickets.objects.all().order_by('-ticket_id')
        serializer = ExportTicketSerializer(tickets, many=True)
        return Response(serializer.data)

    def post(self, request):
        data = request.data
        user_id = data.get('user_id')
        reason = data.get('reason')
        notes = data.get('notes')
        items = data.get('items', [])

        if not items:
            return Response({'error': 'Danh sách sách xuất kho không được để trống'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = Users.objects.get(user_id=user_id) if user_id else None
        except Users.DoesNotExist:
            user = None

        # Create Export Ticket
        ticket = ExportTickets.objects.create(
            user=user,
            reason=reason,
            notes=notes
        )

        for item in items:
            book_id = item.get('book_id')
            quantity = int(item.get('quantity', 0))

            if quantity <= 0:
                continue

            try:
                book = Books.objects.get(book_id=book_id)
                # Deduct stock
                if book.stock is not None:
                    if book.stock < quantity:
                        return Response({'error': f'Sách "{book.title}" không đủ tồn kho (còn {book.stock})'}, status=status.HTTP_400_BAD_REQUEST)
                    book.stock -= quantity
                    book.save()

                ExportTicketDetails.objects.create(
                    ticket=ticket,
                    book=book,
                    quantity=quantity
                )
            except Books.DoesNotExist:
                continue

        serializer = ExportTicketSerializer(ticket)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

from django.db import transaction

class ExportDetailAPIView(APIView):
    def get(self, request, ticket_id):
        try:
            ticket = ExportTickets.objects.get(ticket_id=ticket_id)
            serializer = ExportTicketSerializer(ticket)
            return Response(serializer.data)
        except ExportTickets.DoesNotExist:
            return Response({'error': 'Không tìm thấy phiếu xuất'}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, ticket_id):
        try:
            ticket = ExportTickets.objects.get(ticket_id=ticket_id)
        except ExportTickets.DoesNotExist:
            return Response({'error': 'Không tìm thấy phiếu xuất'}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        reason = data.get('reason', ticket.reason)
        notes = data.get('notes', ticket.notes)
        items = data.get('items')

        with transaction.atomic():
            ticket.reason = reason
            ticket.notes = notes
            ticket.save()

            if items is not None:
                # Trả lại tồn kho cũ
                for detail in ticket.exportticketdetails_set.all():
                    if detail.book and detail.book.stock is not None:
                        detail.book.stock += detail.quantity
                        detail.book.save()
                
                # Xóa chi tiết cũ
                ticket.exportticketdetails_set.all().delete()

                # Tạo chi tiết mới và trừ tồn kho
                for item in items:
                    book_id = item.get('book_id')
                    quantity = int(item.get('quantity', 0))

                    if quantity <= 0:
                        continue

                    try:
                        book = Books.objects.get(book_id=book_id)
                        if book.stock is not None:
                            if book.stock < quantity:
                                raise ValueError(f'Sách "{book.title}" không đủ tồn kho (còn {book.stock})')
                            book.stock -= quantity
                            book.save()

                        ExportTicketDetails.objects.create(
                            ticket=ticket,
                            book=book,
                            quantity=quantity
                        )
                    except Books.DoesNotExist:
                        continue
                    except ValueError as e:
                        # Transaction rollback will happen if we raise an exception
                        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # Refresh ticket data
        ticket = ExportTickets.objects.get(ticket_id=ticket_id)
        serializer = ExportTicketSerializer(ticket)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, ticket_id):
        try:
            ticket = ExportTickets.objects.get(ticket_id=ticket_id)
            with transaction.atomic():
                # Trả lại tồn kho
                for detail in ticket.exportticketdetails_set.all():
                    if detail.book and detail.book.stock is not None:
                        detail.book.stock += detail.quantity
                        detail.book.save()
                
                ticket.delete()
            return Response({'message': 'Xóa phiếu xuất thành công'}, status=status.HTTP_200_OK)
        except ExportTickets.DoesNotExist:
            return Response({'error': 'Không tìm thấy phiếu xuất'}, status=status.HTTP_404_NOT_FOUND)

from .models import ImportTickets, ImportTicketDetails
from .serializers import ImportTicketSerializer

class ImportAPIView(APIView):
    def get(self, request):
        tickets = ImportTickets.objects.all().order_by('-ticket_id')
        serializer = ImportTicketSerializer(tickets, many=True)
        return Response(serializer.data)

    def post(self, request):
        data = request.data
        user_id = data.get('user_id')
        supplier = data.get('supplier')
        notes = data.get('notes')
        total_amount = data.get('total_amount', 0)
        items = data.get('items', [])

        if not items:
            return Response({'error': 'Danh sách sách nhập kho không được để trống'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = Users.objects.get(user_id=user_id) if user_id else None
        except Users.DoesNotExist:
            user = None

        with transaction.atomic():
            ticket = ImportTickets.objects.create(
                user=user,
                supplier=supplier,
                notes=notes,
                total_amount=total_amount
            )

            for item in items:
                book_id = item.get('book_id')
                quantity = int(item.get('quantity', 0))
                unit_price = item.get('unit_price', 0)

                if quantity <= 0:
                    continue

                try:
                    book = Books.objects.get(book_id=book_id)
                    book.stock = (book.stock or 0) + quantity
                    book.save()

                    ImportTicketDetails.objects.create(
                        ticket=ticket,
                        book=book,
                        quantity=quantity,
                        unit_price=unit_price
                    )
                except Books.DoesNotExist:
                    continue

        serializer = ImportTicketSerializer(ticket)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ImportDetailAPIView(APIView):
    def get(self, request, ticket_id):
        try:
            ticket = ImportTickets.objects.get(ticket_id=ticket_id)
            serializer = ImportTicketSerializer(ticket)
            return Response(serializer.data)
        except ImportTickets.DoesNotExist:
            return Response({'error': 'Không tìm thấy phiếu nhập'}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, ticket_id):
        try:
            ticket = ImportTickets.objects.get(ticket_id=ticket_id)
        except ImportTickets.DoesNotExist:
            return Response({'error': 'Không tìm thấy phiếu nhập'}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        supplier = data.get('supplier', ticket.supplier)
        notes = data.get('notes', ticket.notes)
        total_amount = data.get('total_amount', ticket.total_amount)
        items = data.get('items')

        with transaction.atomic():
            ticket.supplier = supplier
            ticket.notes = notes
            ticket.total_amount = total_amount
            ticket.save()

            if items is not None:
                for detail in ticket.importticketdetails_set.all():
                    if detail.book and detail.book.stock is not None:
                        detail.book.stock = max(0, detail.book.stock - detail.quantity)
                        detail.book.save()
                
                ticket.importticketdetails_set.all().delete()

                for item in items:
                    book_id = item.get('book_id')
                    quantity = int(item.get('quantity', 0))
                    unit_price = item.get('unit_price', 0)

                    if quantity <= 0:
                        continue

                    try:
                        book = Books.objects.get(book_id=book_id)
                        book.stock = (book.stock or 0) + quantity
                        book.save()

                        ImportTicketDetails.objects.create(
                            ticket=ticket,
                            book=book,
                            quantity=quantity,
                            unit_price=unit_price
                        )
                    except Books.DoesNotExist:
                        continue

        ticket = ImportTickets.objects.get(ticket_id=ticket_id)
        serializer = ImportTicketSerializer(ticket)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, ticket_id):
        try:
            ticket = ImportTickets.objects.get(ticket_id=ticket_id)
            with transaction.atomic():
                for detail in ticket.importticketdetails_set.all():
                    if detail.book and detail.book.stock is not None:
                        detail.book.stock = max(0, detail.book.stock - detail.quantity)
                        detail.book.save()
                
                ticket.delete()
            return Response({'message': 'Xóa phiếu nhập thành công'}, status=status.HTTP_200_OK)
        except ImportTickets.DoesNotExist:
            return Response({'error': 'Không tìm thấy phiếu nhập'}, status=status.HTTP_404_NOT_FOUND)
