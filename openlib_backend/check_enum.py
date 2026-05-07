import django, os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'openlib_backend.settings')
django.setup()
from django.db import connection
c = connection.cursor()
c.execute("SELECT e.enumlabel FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'ticket_status_enum' ORDER BY e.enumsortorder")
rows = c.fetchall()
print('ENUM values:', [r[0] for r in rows])

# Also check actual data
from api.models import BorrowTickets
all_t = BorrowTickets.objects.all()
print('Total tickets:', all_t.count())
for t in all_t:
    print(f'  #{t.ticket_id} status={repr(t.status)}')
