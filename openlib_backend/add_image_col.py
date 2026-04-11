import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'openlib_backend.settings')
django.setup()

from django.db import connection

with connection.cursor() as cursor:
    try:
        cursor.execute("ALTER TABLE books ADD COLUMN image character varying(255);")
        print("Successfully added image column to books table.")
    except Exception as e:
        print("Failed or column already exists:", e)
