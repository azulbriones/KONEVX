export type ContactRequirement = "EMAIL" | "PHONE";

export type EventListItem = {
	id: number;
	name: string;
	slug: string;
	isPublished: boolean;
	capacity: number;
	contactRequirement: ContactRequirement;
	createdAt: string;
};

export type EventDetail = {
	id: number;
	name: string;
	slug: string;
	isPublished: boolean;
	capacity: number;
	contactRequirement: ContactRequirement;
	createdAt: string;
	updatedAt: string;
};

export type EventStats = {
	fieldsCount: number;
	registrationsCount: number;
	occupancy: number | null;
};

export type CreateEventInput = {
	name: string;
	slug: string;
	capacity: number;
	contactRequirement: ContactRequirement;
	isPublished?: boolean;
};

export type Ctx = {
	event: { capacity: number };
	stats: {
		fieldsCount: number;
		registrationsCount: number;
		occupancy: number | null;
	};
};

export type RegistrationStatus =
	| "REGISTERED"
	| "CANCELLED"
	| "CONFIRMED"
	| "ATTENDED"
	| "NO_SHOW";

export type RegistrationListItem = {
	id: number;
	status: RegistrationStatus;
	createdAt: string;
	participant: {
		id: number;
		emailNormalized: string | null;
		phoneNormalized: string | null;
	};
};

export type RegistrationsMeta = {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
};

export type RegistrationsListResponse = {
	meta: RegistrationsMeta;
	items: RegistrationListItem[];
};

export type ListRegistrationsQuery = {
	page?: number;
	limit?: number;
	status?: RegistrationStatus;
	q?: string;
};
