from rest_framework import serializers
from .models import Books, Authors, Categories, Users, BorrowTickets, BorrowTicketDetails, Publishers, Reviews, Fines

class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Authors
        fields = '__all__'

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Categories
        fields = '__all__'

class PublisherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Publishers
        fields = '__all__'

class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.full_name')
    user_username = serializers.ReadOnlyField(source='user.username')
    class Meta:
        model = Reviews
        fields = '__all__'

class FineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fines
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Users
        fields = ['user_id', 'username', 'password', 'full_name', 'email', 'role', 'is_active', 'created_at']
        extra_kwargs = {
            'is_active': {'default': True}
        }

    def create(self, validated_data):
        from django.contrib.auth.hashers import make_password
        password = validated_data.pop('password', None)
        if not password:
            raise serializers.ValidationError({"password": "Mật khẩu không được để trống khi tạo mới."})
        validated_data['password_hash'] = make_password(password)
        if 'is_active' not in validated_data:
            validated_data['is_active'] = True
        return super().create(validated_data)

    def update(self, instance, validated_data):
        from django.contrib.auth.hashers import make_password
        password = validated_data.pop('password', None)
        if password:
            instance.password_hash = make_password(password)
        return super().update(instance, validated_data)

class BookSerializer(serializers.ModelSerializer):
    author_name = serializers.ReadOnlyField(source='author.name')
    category_name = serializers.ReadOnlyField(source='category.name')
    publisher_name = serializers.ReadOnlyField(source='publisher.name')
    class Meta:
        model = Books
        fields = '__all__'

class BorrowTicketDetailSerializer(serializers.ModelSerializer):
    book_title = serializers.ReadOnlyField(source='book.title')
    class Meta:
        model = BorrowTicketDetails
        fields = ['book', 'book_title', 'due_date', 'return_date', 'is_returned']

class BorrowTicketSerializer(serializers.ModelSerializer):
    member_name = serializers.ReadOnlyField(source='member.full_name')
    # Lấy danh sách chi tiết các cuốn sách trong phiếu này
    details = BorrowTicketDetailSerializer(many=True, read_only=True, source='borrowticketdetails_set')
    
    class Meta:
        model = BorrowTickets
        fields = '__all__'