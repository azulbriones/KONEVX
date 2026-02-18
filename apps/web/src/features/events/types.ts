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
