export type ContactRequirement = "EMAIL" | "PHONE";

export type EventMemberRole = "EDITOR" | "VIEWER";

export type EventAccessScope = "SUPER_ADMIN" | "MEMBER" | "NONE";

export type EventAccess = {
	scope: EventAccessScope;
	isSuperAdmin: boolean;
	eventRole: EventMemberRole | null;
	canRead: boolean;
	canWrite: boolean;
	canManageMembers: boolean;
	canManageFields: boolean;
	canExport: boolean;
};

export type EventDetail = {
	id: number;
	name: string;
	slug: string;
	isPublished: boolean;
	capacity: number;
	contactRequirement: ContactRequirement;

	organizerName: string;
	slogan: string | null;
	description: string;
	footerDescription: string | null;
	location: string;

	startDate: string | null;
	endDate: string | null;
	entryTime: string | null;
	exitTime: string | null;

	cost: number | null;
	minAge: number | null;

	logo: string | null;
	promotionalVideo: string | null;
	promotionalImages: string[] | null;

	contactInfo: string | null;
	socialMediaInfo: string | null;
	hashtag: string | null;

	thingsToBring: string | null;
	thingsNotToBring: string | null;
	note: string | null;

	createdAt: string;
	updatedAt: string;
};

export interface GroupDistribution {
	prefix: string;
	subgroupsCount: number;
}

export interface GroupingSettings {
	enabled: boolean;
	customFieldId: number | "";
	hasSubgroups: boolean;
	distribution: Record<string, GroupDistribution>;
}

export type CreateEventInput = {
	name: string;
	slug: string;
	capacity: number;
	contactRequirement: ContactRequirement;
	isPublished?: boolean;
	organizerName: string;
	description: string;
	location: string;

	slogan?: string;
	footerDescription?: string;

	startDate?: string;
	endDate?: string;
	entryTime?: string;
	exitTime?: string;

	cost?: number;
	minAge?: number;

	contactInfo?: string;
	socialMediaInfo?: string;
	hashtag?: string;

	thingsToBring?: string;
	thingsNotToBring?: string;
	note?: string;

	logo?: any;
	promotionalVideo?: any;
	promotionalImages?: any;
	groupingSettings?: GroupingSettings;
};

export type EventOutletCtx = {
	event: EventDetail;
	stats: EventStats;
	access: EventAccess;
};

export type EventListItem = {
	id: number;
	name: string;
	slug: string;
	isPublished: boolean;
	capacity: number;
	contactRequirement: ContactRequirement;
	createdAt: string;
	access: EventAccess;
};

export type EventStats = {
	fieldsCount: number;
	registrationsCount: number;
	occupancy: number | null;
};

export type EventDetailResponse = {
	event: EventDetail;
	access: EventAccess;
	stats: EventStats;
};



export type Ctx = {
	event: EventDetail;
	access: EventAccess;
	stats: EventStats;
};

// -------------------- Registrations --------------------

export type RegistrationStatus =
	| "REGISTERED"
	| "CANCELLED"
	| "CONFIRMED"
	| "ATTENDED"

export interface RegistrationItem {
	id: number;
	status: RegistrationStatus;
	createdAt: string;
	contact: {
		id: number;
		email: string | null;
		phone: string | null;
	};
	answers: Record<string, {
		label: string;
		type: string;
		value: any;
	}>;
	assignedGroup: string | null;
};

export type RegistrationsMeta = {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
};

export type ListRegistrationsQuery = {
	page?: number;
	limit?: number;
	status?: RegistrationStatus;
	q?: string;
};

export type RegistrationsListResponse = {
	meta: RegistrationsMeta;
	items: RegistrationItem[];
};

// -------------------- Fields --------------------

export type FieldType =
	| "TEXT"
	| "TEXTAREA"
	| "NUMBER"
	| "DATE"
	| "SELECT"
	| "MULTI_SELECT"
	| "CHECKBOX";

export type EventField = {
	id: number;
	key: string;
	label: string;
	type: FieldType;
	required: boolean;
	order: number;
	options?: string[];
};

// -------------------- Members --------------------

export type EventMember = {
	userId: number;
	email: string;
	globalRole: string;
	eventRole: EventMemberRole;
	createdAt: string;
};

export type AddEventMemberInput = {
	email: string;
	role: EventMemberRole;
};

export type UpdateEventMemberRoleInput = {
	role: EventMemberRole;
};

export type ListEventMembersResponse = {
	members: EventMember[];
};
