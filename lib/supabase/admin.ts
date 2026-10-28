import { createClient } from '@supabase/supabase-js';

// Só no servidor. Ignora RLS: usar apenas em rotas que validam tudo por conta própria.
export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}
