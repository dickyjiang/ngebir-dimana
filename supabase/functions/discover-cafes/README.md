# discover-cafes Edge Function

Automatically discovers new cafes via Google Places API (New) and inserts them
into the `cafes` table with `is_published = false` for manual review.

---

## 1. Set the secret

```bash
supabase secrets set GOOGLE_PLACES_API_KEY=your_key_here
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically by
the Supabase runtime — you do not need to set them manually.

---

## 2. Deploy

```bash
supabase functions deploy discover-cafes
```

---

## 3. Run the SQL migration

Apply the migration in the Supabase SQL editor (or via CLI):

```bash
supabase db push
```

Or paste `supabase/migrations/add_discovery_columns.sql` directly into the
Supabase SQL editor and run it.

---

## 4. Schedule daily at 02:00 UTC (09:00 WIB)

Run this once in the **Supabase SQL editor** to register the pg_cron job:

```sql
SELECT cron.schedule(
  'daily-cafe-discovery',
  '0 2 * * *',
  $$
  SELECT net.http_post(
    url := 'https://iblcxviqmqiutjzxnblx.supabase.co/functions/v1/discover-cafes',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.anon_key')
    )
  );
  $$
);
```

> **Note:** `pg_net` and `pg_cron` must be enabled in your project
> (Database → Extensions). The anon key must be stored as
> `app.settings.anon_key` — set it once with:
>
> ```sql
> ALTER DATABASE postgres SET "app.settings.anon_key" = 'your_anon_key_here';
> ```

To verify the schedule was created:

```sql
SELECT * FROM cron.job WHERE jobname = 'daily-cafe-discovery';
```

To remove it:

```sql
SELECT cron.unschedule('daily-cafe-discovery');
```

---

## 5. Review and approve pending cafes

After a run, inspect the newly discovered cafes:

```sql
SELECT id, name, city, rating, reviews, source, created_at
FROM cafes
WHERE is_published = false
ORDER BY created_at DESC;
```

Bulk-approve all auto-discovered cafes:

```sql
UPDATE cafes
SET is_published = true
WHERE source = 'auto-discovered'
  AND is_published = false;
```

---

## 6. Test locally

```bash
supabase functions serve discover-cafes
```

Then in a second terminal:

```bash
curl http://localhost:54321/functions/v1/discover-cafes
```

Example successful response:

```json
{
  "success": true,
  "inserted_count": 7,
  "cafes": [
    { "name": "Kopi Kenangan", "city": "Jakarta", "google_place_id": "ChIJ...", "rating": 4.4 }
  ]
}
```
