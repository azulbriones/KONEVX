export type LogLevel = "debug" | "info" | "warn" | "error";

type LogPayload = Record<string, unknown>;

function nowIso() {
	return new Date().toISOString();
}

export const logger = {
	log(level: LogLevel, msg: string, payload: LogPayload = {}) {
		// eslint-disable-next-line no-console
		console[level === "debug" ? "log" : level](
			JSON.stringify({
				ts: nowIso(),
				level,
				msg,
				...payload,
			}),
		);
	},

	debug(msg: string, payload?: LogPayload) {
		this.log("debug", msg, payload);
	},
	info(msg: string, payload?: LogPayload) {
		this.log("info", msg, payload);
	},
	warn(msg: string, payload?: LogPayload) {
		this.log("warn", msg, payload);
	},
	error(msg: string, payload?: LogPayload) {
		this.log("error", msg, payload);
	},
};
