-- Czyszczenie historii uruchomień pg_cron
-- send-prayer-reminders działa co minutę, więc cron.job_run_details rośnie o ok. 1440 wierszy dziennie,
-- a pg_cron nie usuwa starych wpisów sam. Zostaje ostatni tydzień — wystarczy do sprawdzania wysyłki.
-- Według start_time, nie end_time — uruchomienie przerwane np. restartem bazy nie ma end_time i zostałoby na zawsze.
-- Codziennie o 3:30 UTC, z dala od send-push-daily (7:00 UTC).
-- cron.schedule z istniejącą nazwą podmienia zadanie, więc ponowne uruchomienie migracji nie tworzy duplikatu.

SELECT cron.schedule(
    'cleanup-cron-history',
    '30 3 * * *',
    $$DELETE FROM cron.job_run_details WHERE start_time < now() - interval '7 days'$$
);
