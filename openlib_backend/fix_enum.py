"""
Script để thêm các giá trị mới vào ENUM ticket_status_enum trong PostgreSQL
và cập nhật data sẵn có trong DB.
"""
import django, os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'openlib_backend.settings')
django.setup()
from django.db import connection

c = connection.cursor()

# 1. Kiểm tra enum hiện tại
c.execute("SELECT e.enumlabel FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'ticket_status_enum' ORDER BY e.enumsortorder")
current_values = [r[0] for r in c.fetchall()]
print('Current ENUM values:', current_values)

# 2. Thêm các giá trị mới nếu chưa có (PostgreSQL 9.1+)
new_values = ['Pending', 'Rejected', 'Returned']
for val in new_values:
    if val not in current_values:
        try:
            c.execute(f"ALTER TYPE ticket_status_enum ADD VALUE '{val}'")
            print(f'Added: {val}')
        except Exception as e:
            print(f'Error adding {val}:', e)
    else:
        print(f'Already exists: {val}')

connection.commit()

# 3. Verify
c.execute("SELECT e.enumlabel FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'ticket_status_enum' ORDER BY e.enumsortorder")
final_values = [r[0] for r in c.fetchall()]
print('Final ENUM values:', final_values)

print('\nDone!')
