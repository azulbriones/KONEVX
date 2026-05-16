import { useQuery } from "@tanstack/react-query";
import { getPublicEventBySlug } from "../api/publicEvents.service";
import type { ApiErr } from "@/types/api";

export const publicEventKeys = {
  all: ["public-event"] as const,
  detail: (slug: string) => [...publicEventKeys.all, "detail", slug] as const,
};

export function usePublicEvent(slug: string) {
  return useQuery({
    queryKey: publicEventKeys.detail(slug),
    queryFn: () => getPublicEventBySlug(slug),
    enabled: !!slug,
    staleTime: 30_000,
    retry: (failureCount: number, error: ApiErr) => {
      if (error.error.code === "EVENT_NOT_FOUND") {
        return false;
      }
      return failureCount < 3;
    },
  });
}
