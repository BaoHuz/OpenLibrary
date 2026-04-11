import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "openlib_backend.settings")
django.setup()

from api.models import Books, Users, Reviews, Fines

def populate():
    print("Populating Reviews and Fines...")
    
    # Get arbitrary books and users
    books = list(Books.objects.all()[:3])
    users = list(Users.objects.all()[:3])

    if not books or not users:
        print("Not enough books or users to populate data.")
        return

    # Clear old data
    Reviews.objects.all().delete()
    Fines.objects.all().delete()

    # Create reviews
    print("Creating reviews...")
    Reviews.objects.create(book=books[0], user=users[0], rating=5, comment="Rất hay và ý nghĩa, tôi đọc một mạch hết sạch cuốn này!")
    if len(books) > 1 and len(users) > 1:
        Reviews.objects.create(book=books[1], user=users[1], rating=4, comment="Nội dung truyền cảm hứng mạnh mẽ.")
    if len(books) > 2 and len(users) > 2:
        Reviews.objects.create(book=books[2], user=users[2], rating=3, comment="Sách hơi khó hiểu với người mới bắt đầu.")

    # Create fines
    print("Creating fines...")
    Fines.objects.create(user=users[0], amount=50000.00, reason="Làm rách trang sách 45", is_paid=False)
    if len(users) > 1:
        Fines.objects.create(user=users[1], amount=10000.00, reason="Trả sách quá hạn 2 ngày", is_paid=True)
    if len(users) > 2:
        Fines.objects.create(user=users[2], amount=150000.00, reason="Làm mất hoàn toàn cuốn tiểu thuyết", is_paid=False)

    print("Success!")

if __name__ == '__main__':
    populate()
