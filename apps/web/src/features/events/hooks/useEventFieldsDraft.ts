import { useEffect, useMemo, useState } from "react";
import type { EventField } from "../types";
import { useEventFields, useReplaceEventFields } from "./useEventFields";

type Draft = EventField[];

function normalizeForCompare(fields: Draft) {
	const normalized = [...fields]
		.sort((a, b) => a.order - b.order)
		.map((f, idx) => {
			const isSelect = f.type === "SELECT" || f.type === "MULTI_SELECT";
			const options = isSelect
				? (f.options ?? []).map((x) => x.trim()).filter(Boolean)
				: undefined;

			return {
				id: f.id,
				key: f.key.trim(),
				label: f.label.trim(),
				type: f.type,
				required: !!f.required,
				order: idx,
				options,
			};
		});

	return JSON.stringify(normalized);
}

function normalizeForApi(fields: Draft): Omit<EventField, "id">[] {
	return [...fields]
		.sort((a, b) => a.order - b.order)
		.map((f, idx) => {
			const isSelect = f.type === "SELECT" || f.type === "MULTI_SELECT";
			const options = isSelect
				? (f.options ?? []).map((x) => x.trim()).filter(Boolean)
				: undefined;

			return {
				key: f.key.trim(),
				label: f.label.trim(),
				type: f.type,
				required: !!f.required,
				order: idx,
				...(isSelect ? { options } : {}),
			};
		});
}

export const useEventFieldsDraft = (eventId: number) => {
	const q = useEventFields(eventId);
	const save = useReplaceEventFields(eventId);

	const remote = q.data ?? [];
	const [draft, setDraft] = useState<Draft>([]);
	const [dirty, setDirty] = useState(false);

	const remoteSig = useMemo(() => normalizeForCompare(remote), [remote]);
	const draftSig = useMemo(() => normalizeForCompare(draft), [draft]);

	useEffect(() => {
		if (!dirty) setDraft(remote);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [remoteSig]);

	useEffect(() => {
		setDirty(draftSig !== remoteSig);
	}, [draftSig, remoteSig]);

	const reset = () => setDraft(remote);

	const saveDraft = async () => {
		const payload = normalizeForApi(draft);
		const newRemote = await save.mutateAsync(payload);
		setDraft(newRemote);
		setDirty(false);
	};

	return {
		...q,
		draft,
		setDraft,
		dirty,
		reset,
		saveDraft,
		saving: save.isPending,
		saveError: save.error,
	};
};
