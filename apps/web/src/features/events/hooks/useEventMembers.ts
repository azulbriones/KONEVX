import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	addEventMember,
	listEventMembers,
	removeEventMember,
	updateEventMemberRole,
} from "../api/eventMembers.service";
import type {
	AddEventMemberInput,
	EventMember,
	EventMemberRole,
} from "../types";
import { eventsKeys } from "./useEvents";

export const membersKeys = {
	all: (eventId: number) =>
		[...eventsKeys.detail(eventId), "members"] as const,
};

export function useEventMembers(eventId: number) {
	return useQuery<EventMember[]>({
		queryKey: membersKeys.all(eventId),
		queryFn: () => listEventMembers(eventId),
		enabled: Number.isFinite(eventId) && eventId > 0,
		staleTime: 30_000,
		placeholderData: (prev: any) => prev,
	});
}

export function useAddEventMember(eventId: number) {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: (input: AddEventMemberInput) =>
			addEventMember(eventId, input),
		onSuccess: async () => {
			await qc.invalidateQueries({ queryKey: membersKeys.all(eventId) });
		},
	});
}

export function useUpdateEventMemberRole(eventId: number) {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: (args: { userId: number; role: EventMemberRole }) =>
			updateEventMemberRole(eventId, args.userId, { role: args.role }),

		onMutate: async ({ userId, role }) => {
			await qc.cancelQueries({ queryKey: membersKeys.all(eventId) });
			const prev = qc.getQueryData<EventMember[]>(
				membersKeys.all(eventId),
			);

			qc.setQueryData<EventMember[] | undefined>(
				membersKeys.all(eventId),
				(old: any[]) => {
					if (!old) return old;
					return old.map((m) =>
						m.userId === userId ? { ...m, eventRole: role } : m,
					);
				},
			);

			return { prev };
		},

		onError: (_err: any, _vars: any, ctx: { prev: any }) => {
			if (ctx?.prev) qc.setQueryData(membersKeys.all(eventId), ctx.prev);
		},

		onSettled: async () => {
			await qc.invalidateQueries({ queryKey: membersKeys.all(eventId) });
		},
	});
}

export function useRemoveEventMember(eventId: number) {
	const qc = useQueryClient();

	return useMutation({
		mutationFn: (userId: number) => removeEventMember(eventId, userId),

		onMutate: async (userId: any) => {
			await qc.cancelQueries({ queryKey: membersKeys.all(eventId) });
			const prev = qc.getQueryData<EventMember[]>(
				membersKeys.all(eventId),
			);

			qc.setQueryData<EventMember[] | undefined>(
				membersKeys.all(eventId),
				(old: any[] | undefined) => {
					if (!old) return old;
					return old.filter((m) => m.userId !== userId);
				},
			);

			return { prev };
		},

		onError: (_err: any, _userId: any, ctx: { prev: any }) => {
			if (ctx?.prev) qc.setQueryData(membersKeys.all(eventId), ctx.prev);
		},

		onSettled: async () => {
			await qc.invalidateQueries({ queryKey: membersKeys.all(eventId) });
		},
	});
}
