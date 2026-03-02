export type ContactRequirement = "EMAIL" | "PHONE";

export type PublicFieldType =
	| "TEXT"
	| "NUMBER"
	| "DATE"
	| "SELECT"
	| "MULTI_SELECT"
	| "CHECKBOX";

export type PublicEventField = {
	id: number;
	key: string;
	label: string;
	type: PublicFieldType;
	required: boolean;
	order: number;
	options?: string[] | null;
};

export type PublicEventSummary = {
	id: number;
	name: string;
	slug: string;
	capacity: number;
	remaining: number;
	contactRequirement: ContactRequirement;
};

export type GetPublicEventResponse = {
	event: PublicEventSummary;
	fields: PublicEventField[];
};

export type PublicRegisterInput = {
	contact: {
		email?: string | null;
		phone?: string | null;
	};
	answers: Record<string, unknown>;
};

export type PublicRegisterResponse = {
	status: "CREATED" | "EXISTS";
	registration: {
		id: number;
		status: string;
		createdAt: string;
	};
};
