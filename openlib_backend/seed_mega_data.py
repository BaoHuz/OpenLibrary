import os
import django
import random

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "openlib_backend.settings")
django.setup()

from api.models import Categories, Authors, Publishers, Books, Users, Reviews

def populate():
    print("Populating Massive Mock Data for Library UI...")
    
    # 1. Categories
    cat_names = [
        "Văn Học Nước Ngoài", "Kỹ Năng Sống", "Công Nghệ - Lập Trình", 
        "Tâm Lý - Hành Vi", "Lịch Sử Nhân Loại", "Kinh Tế - Khởi Nghiệp"
    ]
    categories_obj = {}
    for name in cat_names:
        c, created = Categories.objects.get_or_create(name=name)
        if hasattr(c, 'description') and created:
            c.description = f"Chuyên mục {name} mang đến nhiều kiến thức bổ ích."
            c.save()
        categories_obj[name] = c

    # 2. Authors
    author_list = [
        ("Haruki Murakami", "Tiểu thuyết gia người Nhật Bản, cha đẻ của 'Rừng Nauy'."),
        ("Robert Kiyosaki", "Doanh nhân, nhà đầu tư, tác giả cuốn Dạy Con Làm Giàu."),
        ("Dale Carnegie", "Người viết ra Đắc Nhân Tâm - một trong những sách bán chạy nhất mọi thời đại."),
        ("Nguyễn Nhật Ánh", "Nhà văn Việt Nam nổi tiếng với các tác phẩm viết về tuổi thơ."),
        ("Yuval Noah Harari", "Sử gia, giáo sư đại học và tác giả của Sapiens."),
    ]
    authors_obj = []
    for name, bio in author_list:
        a, _ = Authors.objects.get_or_create(name=name)
        a.bio = bio
        a.save()
        authors_obj.append(a)

    # 3. Publishers
    pubs = ["NXB Trẻ", "NXB Kim Đồng", "Nhã Nam", "Alphabooks"]
    pubs_obj = []
    for p in pubs:
        pb, _ = Publishers.objects.get_or_create(name=p)
        pubs_obj.append(pb)

    # 4. Books with Unsplash URLs for Book Covers
    books_data = [
        {
            "title": "Rừng Na Uy - Tái Bản Đặc Biệt 2026",
            "cat": categories_obj["Văn Học Nước Ngoài"],
            "author": authors_obj[0],
            "pub": pubs_obj[0],
            "price": 120000,
            "stock": 5,
            "isbn": "978-vn-010",
            "image": "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop"
        },
        {
            "title": "Dạy Con Làm Giàu - Tập 1",
            "cat": categories_obj["Kinh Tế - Khởi Nghiệp"],
            "author": authors_obj[1],
            "pub": pubs_obj[3],
            "price": 95000,
            "stock": 10,
            "isbn": "978-vn-011",
            "image": "https://images.unsplash.com/photo-1553729459-efe14ef20550?q=80&w=800&auto=format&fit=crop"
        },
        {
            "title": "Sapiens: Lược Sử Loài Người",
            "cat": categories_obj["Lịch Sử Nhân Loại"],
            "author": authors_obj[4],
            "pub": pubs_obj[2],
            "price": 250000,
            "stock": 3,
            "isbn": "978-vn-012",
            "image": "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=800&auto=format&fit=crop"
        },
        {
            "title": "Đắc Nhân Tâm",
            "cat": categories_obj["Kỹ Năng Sống"],
            "author": authors_obj[2],
            "pub": pubs_obj[0],
            "price": 80000,
            "stock": 0,
            "isbn": "978-vn-013",
            "image": "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=800&auto=format&fit=crop"
        },
        {
            "title": "Mắt Biếc (Bản Nâng Cấp)",
            "cat": categories_obj["Văn Học Nước Ngoài"],
            "author": authors_obj[3],
            "pub": pubs_obj[1],
            "price": 110000,
            "stock": 15,
            "isbn": "978-vn-014",
            "image": "https://images.unsplash.com/photo-1476275466078-4007374efbbe?q=80&w=800&auto=format&fit=crop"
        },
        {
            "title": "Clean Code: Cẩm nang Lập trình",
            "cat": categories_obj["Công Nghệ - Lập Trình"],
            "author": authors_obj[0], 
            "pub": pubs_obj[3],
            "price": 320000,
            "stock": 2,
            "isbn": "978-vn-015",
            "image": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop"
        },
        {
            "title": "Tâm Lý Học Tội Phạm",
            "cat": categories_obj["Tâm Lý - Hành Vi"],
            "author": authors_obj[2], 
            "pub": pubs_obj[2],
            "price": 185000,
            "stock": 7,
            "isbn": "978-vn-016",
            "image": "https://images.unsplash.com/photo-1587876931567-564ce588bfbd?q=80&w=800&auto=format&fit=crop"
        },
        {
            "title": "Hành Trình Về Phương Đông",
            "cat": categories_obj["Tâm Lý - Hành Vi"],
            "author": authors_obj[4], 
            "pub": pubs_obj[0],
            "price": 145000,
            "stock": 12,
            "isbn": "978-vn-017",
            "image": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800&auto=format&fit=crop"
        }
    ]

    for bd in books_data:
        Books.objects.get_or_create(
            isbn=bd["isbn"],
            defaults={
                "title": bd["title"],
                "category": bd["cat"],
                "author": bd["author"],
                "publisher": bd["pub"],
                "stock": bd["stock"],
                "image": bd["image"]
            }
        )

    # 5. Reviews Array
    users = Users.objects.all()
    books_all = Books.objects.all()
    
    if len(users) > 0 and len(books_all) > 0:
        Reviews.objects.all().delete()
        comments = [
            "Quyển sách này thực sự thay đổi cuộc đời tôi! Phải mua ngay để trên kệ sách nhà mình.",
            "Cách viết cực kỳ lôi cuốn, tôi thức trắng đêm để đọc hết một mạch cuốn tiểu thuyết này.",
            "Tác phẩm mang hơi thở thời đại, sâu sắc và tinh tế. Tác giả đã vượt quá khuôn khổ thường thấy.",
            "Tôi đã tìm kiếm tri thức này rất lâu rồi, bộ phận quản lý thư viện làm rất tốt khi cập nhật quyển này.",
            "Khuyên mọi sinh viên nên mượn đọc cuốn sách này trước khi ra trường để mở mang tầm mắt."
        ]
        for b in books_all:
            for i in range(2):
                Reviews.objects.create(
                    book=b,
                    user=random.choice(users),
                    rating=random.randint(4, 5),
                    comment=random.choice(comments)
                )

    print("SUCCESS: Demo Database has been forcefully replenished!")

if __name__ == '__main__':
    populate()
