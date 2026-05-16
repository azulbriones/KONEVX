import type { RegistrationStatus } from "../types";

export const STATUS_LABEL: Record<RegistrationStatus, string> = {
  REGISTERED: "Registrado",
  CONFIRMED: "Confirmado",
  CANCELLED: "Cancelado",
  ATTENDED: "Asistió",
};

export const STATUS_COLOR: Record<
  RegistrationStatus,
  "default" | "success" | "warning" | "error" | "info"
> = {
  REGISTERED: "info",
  CONFIRMED: "success",
  CANCELLED: "error",
  ATTENDED: "success",
};

export const STATUS_OPTIONS: RegistrationStatus[] = [
  "REGISTERED",
  "CONFIRMED",
  "CANCELLED",
  "ATTENDED",
];
