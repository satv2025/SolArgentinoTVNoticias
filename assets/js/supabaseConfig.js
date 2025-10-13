// assets/js/supabaseConfig.js
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://phzvdoiattmirclgopok.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoenZkb2lhdHRtaXJjbGdvcG9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzMDUyMjIsImV4cCI6MjA3NTg4MTIyMn0.K1YDBY2eTsJ6ATo8n__bp0TLQBlW3oqNe3g9kGsrAQc";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);