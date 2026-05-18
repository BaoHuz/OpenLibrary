# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = True` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
import os
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator


class Authors(models.Model):
    author_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    bio = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='authors_images/', blank=True, null=True)

    def delete(self, *args, **kwargs):
        if self.image:
            self.image.delete(save=False)
        super(Authors, self).delete(*args, **kwargs)

    class Meta:
        managed = True
        db_table = 'authors'


class Books(models.Model):
    book_id = models.AutoField(primary_key=True)
    isbn = models.CharField(unique=True, max_length=20, blank=True, null=True)
    title = models.CharField(unique=True, max_length=255)
    category = models.ForeignKey('Categories', models.DO_NOTHING, blank=True, null=True)
    author = models.ForeignKey(Authors, models.DO_NOTHING, blank=True, null=True)
    publisher = models.ForeignKey('Publishers', models.DO_NOTHING, blank=True, null=True)
    publication_year = models.IntegerField(blank=True, null=True, validators=[MinValueValidator(0)])
    stock = models.IntegerField(blank=True, null=True, validators=[MinValueValidator(0)])
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    image = models.ImageField(upload_to='books_images/', blank=True, null=True)
    
    def delete(self, *args, **kwargs):
        if self.image:
            self.image.delete(save=False)
        super(Books, self).delete(*args, **kwargs)

    class Meta:
        managed = True
        db_table = 'books'


class BorrowTicketDetails(models.Model):
    pk = models.CompositePrimaryKey('ticket_id', 'book_id')
    ticket = models.ForeignKey('BorrowTickets', models.DO_NOTHING)
    book = models.ForeignKey(Books, models.DO_NOTHING)
    due_date = models.DateField()
    return_date = models.DateField(blank=True, null=True)
    is_returned = models.BooleanField(blank=True, null=True)
    quantity = models.IntegerField(default=1, validators=[MinValueValidator(1)])

    class Meta:
        managed = True
        db_table = 'borrow_ticket_details'


class BorrowTickets(models.Model):
    ticket_id = models.AutoField(primary_key=True)
    member = models.ForeignKey('Users', models.DO_NOTHING, blank=True, null=True)
    librarian = models.ForeignKey('Users', models.DO_NOTHING, related_name='borrowtickets_librarian_set', blank=True, null=True)
    borrow_date = models.DateField(blank=True, null=True)
    status = models.TextField(blank=True, null=True)  # This field type is a guess.

    class Meta:
        managed = True
        db_table = 'borrow_tickets'


class Categories(models.Model):
    category_id = models.AutoField(primary_key=True)
    name = models.CharField(unique=True, max_length=100)
    description = models.TextField(blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'categories'


class Publishers(models.Model):
    publisher_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=150)
    address = models.TextField(blank=True, null=True)
    contact_email = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'publishers'


class Users(models.Model):
    user_id = models.AutoField(primary_key=True)
    username = models.CharField(unique=True, max_length=50)
    password_hash = models.CharField(max_length=255)
    full_name = models.CharField(max_length=100)
    email = models.CharField(unique=True, max_length=100, blank=True, null=True)
    role = models.TextField()  # This field type is a guess.
    is_active = models.BooleanField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'users'


class Reviews(models.Model):
    review_id = models.AutoField(primary_key=True)
    book = models.ForeignKey(Books, models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey(Users, models.DO_NOTHING, blank=True, null=True)
    rating = models.IntegerField(blank=True, null=True) # 1-5
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'reviews'


class Fines(models.Model):
    fine_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(Users, models.DO_NOTHING, blank=True, null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    reason = models.CharField(max_length=255, blank=True, null=True)
    is_paid = models.BooleanField(default=False, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'fines'


class ImportTickets(models.Model):
    ticket_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(Users, models.DO_NOTHING, blank=True, null=True)
    import_date = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    supplier = models.CharField(max_length=255, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'import_tickets'


class ImportTicketDetails(models.Model):
    detail_id = models.AutoField(primary_key=True)
    ticket = models.ForeignKey(ImportTickets, models.DO_NOTHING)
    book = models.ForeignKey(Books, models.DO_NOTHING)
    quantity = models.IntegerField(validators=[MinValueValidator(1)])
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'import_ticket_details'


class ExportTickets(models.Model):
    ticket_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(Users, models.DO_NOTHING, blank=True, null=True)
    export_date = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    reason = models.CharField(max_length=255, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'export_tickets'


class ExportTicketDetails(models.Model):
    detail_id = models.AutoField(primary_key=True)
    ticket = models.ForeignKey(ExportTickets, models.DO_NOTHING)
    book = models.ForeignKey(Books, models.DO_NOTHING)
    quantity = models.IntegerField(validators=[MinValueValidator(1)])

    class Meta:
        managed = True
        db_table = 'export_ticket_details'
