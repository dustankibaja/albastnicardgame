import type { createSupabaseServerClient } from "../supabase/server";
import type { ClientLike } from "./auth-core";

export type SupabaseServer = NonNullable<ReturnType<typeof createSupabaseServerClient>>;

/** Explicit adapter from the Supabase client to the small surface the authorization logic needs. */
export function asClientLike(client: SupabaseServer): ClientLike {
  return {
    auth: {
      getUser: () => client.auth.getUser(),
      signInWithPassword: (input) => client.auth.signInWithPassword(input),
      signOut: () => client.auth.signOut(),
    },
    from: (table) => ({
      select: (columns) => ({
        eq: (column, value) => ({
          maybeSingle: async () => {
            const result = await client.from(table).select(columns).eq(column, value).maybeSingle();
            return { data: result.data as { display_name: string } | null, error: result.error };
          },
        }),
      }),
    }),
  };
}
