type EventRole = "EDITOR" | "VIEWER";

export type EventAccess = {
	scope: "SUPER_ADMIN" | "MEMBER" | "NONE";
	isSuperAdmin: boolean;
	eventRole: EventRole | null;

	canRead: boolean;
	canWrite: boolean;
	canManageMembers: boolean;
	canManageFields: boolean;
	canExport: boolean;
};

export function buildEventAccess(params: {
	isSuperAdmin: boolean;
	memberRole?: EventRole | null;
}): EventAccess {
	const isSuperAdmin = params.isSuperAdmin;
	const eventRole: EventRole | null = isSuperAdmin
		? "EDITOR"
		: (params.memberRole ?? null);

	const canRead = isSuperAdmin || !!eventRole;
	const canWrite = isSuperAdmin || eventRole === "EDITOR";

	return {
		scope: isSuperAdmin ? "SUPER_ADMIN" : eventRole ? "MEMBER" : "NONE",
		isSuperAdmin,
		eventRole,
		canRead,
		canWrite,
		canManageMembers: canWrite,
		canManageFields: canWrite,
		canExport: canRead,
	};
}
