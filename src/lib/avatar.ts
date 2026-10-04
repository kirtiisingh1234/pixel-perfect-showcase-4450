import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useAvatarUrl(path: string | null | undefined) {
  return useQuery({
    queryKey: ["avatar", path],
    enabled: !!path,
    queryFn: async () =>
      (await supabase.storage.from("avatars").createSignedUrl(path!, 3600)).data?.signedUrl ?? null,
  });
}
