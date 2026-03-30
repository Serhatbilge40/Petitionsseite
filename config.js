// =========================================================
// SUPABASE KONFIGURATION
// =========================================================
// Trage hier deine Supabase-Zugangsdaten ein.
// Du findest sie unter: https://app.supabase.com → Dein Projekt → Settings → API

const _SUPABASE_URL = 'https://nebwoggthamopmnoejzj.supabase.co';
const _SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lYndvZ2d0aGFtb3Btbm9lanpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4Nzc2NzcsImV4cCI6MjA5MDQ1MzY3N30.lAFdSztT__wSwoQcZGCx62lCFx3U0J8sKtB7Ez9gstc';

// Supabase Client initialisieren
const db = window.supabase.createClient(_SUPABASE_URL, _SUPABASE_ANON_KEY);
