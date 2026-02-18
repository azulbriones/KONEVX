export type ApiOk<T> = { ok: true; data: T };
export type ApiErr = {
	response: any;
	ok: false;
	error: { code: string; message: string; details?: unknown; rid?: string };
};

export type ApiResponse<T> = ApiOk<T> | ApiErr;

export type Paginated<T> = {
	meta: { page: number; limit: number; total: number; totalPages: number };
	items: T[];
};
