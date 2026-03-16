export type ContactRequirement = "EMAIL" | "PHONE";

export type PublicFieldType =
	| "TEXT"
	| "TEXTAREA"
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

	organizerName?: string;
	logo?: string | null;
	slogan?: string | null;
	description?: string;
	backgroundImage?: string | null;
	heroImage?: string | null;

	startDate: string;
	endDate: string;
	location: string;
	entryTime?: string | null;
	exitTime?: string | null;
	cost: number;
	minAge?: number | null;

	// Media y marketing
	promotionalVideo?: string | null;
	promotionalImages?: string[];

	thingsToBring?: string | null;
	thingsNotToBring?: string | null;
	note?: string | null;

	footerDescription?: string | null;
	contactInfo?: any;
	socialMediaInfo?: any;
	hashtag?: string | null;
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
