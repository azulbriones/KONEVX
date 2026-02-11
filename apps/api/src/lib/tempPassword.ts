import crypto from "crypto";

export function generateTempPassword(length = 16): string {
	const alphabet =
		"ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@$%";
	const bytes = crypto.randomBytes(length);
	let out = "";
	for (let i = 0; i < length; i++) {
		out += alphabet[bytes[i] % alphabet.length];
	}
	return out;
}
