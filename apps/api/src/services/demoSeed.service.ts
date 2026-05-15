import { EventRole, FieldType, Prisma, RegistrationStatus, UserRole } from "@prisma/client";
import { hashPassword } from "../lib/crypto.js";
import {
	countDemoRegistrations,
	createDemoRegistration,
	createDemoRegistrationFieldValues,
	findDemoEventBySlug,
	findDemoEventField,
	listDemoEventFields,
	resetDemoEventData,
	updateDemoEventGroupingSettings,
	upsertDemoEvent,
	upsertDemoEventField,
	upsertDemoEventMember,
	upsertDemoParticipant,
	upsertDemoUser,
} from "../repositories/demoSeed.repository.js";

const slug = "pj-huixtla-demo";
const mainEditorEmail = process.env.DEMO_EDITOR_EMAIL ?? "demo_editor@eventplanner.demo";
const mainEditorPassword = process.env.DEMO_EDITOR_PASSWORD ?? "ChangeMe123!";
const commonPassword = "Password123!";

export async function resetAndSeedDemo(options: { reset?: boolean } = {}) {
	const shouldReset = options.reset ?? true;
	let resetPerformed = false;

	console.log(`🚀 Iniciando Seed para el evento: ${slug}...`);

	const existingEvent = await findDemoEventBySlug(slug);

	if (shouldReset && existingEvent) {
		await resetDemoEventData(existingEvent.id);
		resetPerformed = true;
		console.log("🧹 Datos antiguos del evento eliminados.");
	}

	const event = await upsertDemoEvent(slug);

	const testUsersConfig: Array<{ email: string; username: string; role: EventRole }> = [
		{ email: "editor1@demo.com", username: "pedro_editor", role: "EDITOR" },
		{ email: "editor2@demo.com", username: "lucia_editor", role: "EDITOR" },
		{ email: "viewer1@demo.com", username: "sergio_observador", role: "VIEWER" },
		{ email: "checkin1@demo.com", username: "puerta_norte", role: "CHECKIN" },
		{ email: "checkin2@demo.com", username: "puerta_sur", role: "CHECKIN" },
		{ email: "checkin3@demo.com", username: "acceso_principal", role: "CHECKIN" },
		{ email: "checkin4@demo.com", username: "staff_apoyo_1", role: "CHECKIN" },
		{ email: "checkin5@demo.com", username: "staff_apoyo_2", role: "CHECKIN" },
		{ email: "checkin6@demo.com", username: "voluntario_huixtla", role: "CHECKIN" },
		{ email: "checkin7@demo.com", username: "recepcion_retiro", role: "CHECKIN" },
	];

	const hashedCommonPassword = await hashPassword(commonPassword);

	for (const config of testUsersConfig) {
		const user = await upsertDemoUser({
			email: config.email,
			username: config.username,
			passwordHash: hashedCommonPassword,
			role: UserRole.USER,
		});

		await upsertDemoEventMember({
			eventId: event.id,
			userId: user.id,
			role: config.role,
		});
	}

	const mainUser = await upsertDemoUser({
		email: mainEditorEmail,
		username: "admin_general",
		passwordHash: await hashPassword(mainEditorPassword),
		role: UserRole.USER,
	});

	await upsertDemoEventMember({
		eventId: event.id,
		userId: mainUser.id,
		role: EventRole.EDITOR,
	});

	const fieldConfigs = [
		{ key: "nombre_joven", label: "Nombre(s) del joven", type: FieldType.TEXT, required: true, order: 0 },
		{ key: "apellido_joven", label: "Apellido(s) del joven", type: FieldType.TEXT, required: true, order: 1 },
		{ key: "genero", label: "Género", type: FieldType.SELECT, required: true, order: 2, options: ["Masculino", "Femenino"] },
		{ key: "fecha_nacimiento", label: "Fecha de nacimiento", type: FieldType.TEXT, required: true, order: 3 },
		{ key: "edad", label: "Edad", type: FieldType.NUMBER, required: true, order: 4 },
		{ key: "comunidad", label: "Comunidad / Barrio", type: FieldType.TEXT, required: true, order: 5 },
		{ key: "enfermedad", label: "Enfermedad/Alergias", type: FieldType.TEXTAREA, required: false, order: 6 },
		{ key: "tratamiento", label: "Tratamiento", type: FieldType.TEXTAREA, required: false, order: 7 },
		{ key: "nombre_tutor", label: "Nombre(s) del tutor", type: FieldType.TEXT, required: true, order: 8 },
		{ key: "apellido_tutor", label: "Apellido(s) del tutor", type: FieldType.TEXT, required: true, order: 9 },
		{ key: "telefono_tutor", label: "Número de Teléfono del tutor", type: FieldType.TEXT, required: true, order: 10 },
		{ key: "observaciones", label: "Observaciones", type: FieldType.TEXTAREA, required: false, order: 11 },
	];

	for (const f of fieldConfigs) {
		await upsertDemoEventField({
			eventId: event.id,
			key: f.key,
			label: f.label,
			type: f.type,
			required: f.required,
			order: f.order,
			options: f.options ?? null,
		});
	}

	const generoField = await findDemoEventField(event.id, "genero");
	if (generoField) {
		const newSettings: Prisma.JsonObject = {
			...(event.groupingSettings as Prisma.JsonObject),
			customFieldId: generoField.id,
		};
		await updateDemoEventGroupingSettings(event.id, newSettings);
	}

	const currentRegs = await countDemoRegistrations(event.id);
	if (currentRegs < 190) {
		console.log(`⏳ Generando ${190 - currentRegs} registros de prueba para visualización...`);

		const fields = await listDemoEventFields(event.id);
		const names = ["Juan", "Maria", "Pedro", "Ana", "Luis", "Carla", "Diego", "Sofia", "Mateo", "Elena", "Ximena", "Roberto"];
		const lastnames = ["Hernandez", "Garcia", "Lopez", "Martinez", "Perez", "Rodriguez", "Sanchez", "Ramirez", "Huixtla", "Flores"];

		for (let i = currentRegs + 1; i <= 190; i++) {
			const phone = `964${Math.floor(1000000 + Math.random() * 9000000)}`;
			const participant = await upsertDemoParticipant(phone);

			const registration = await createDemoRegistration({
				eventId: event.id,
				participantId: participant.id,
				status: RegistrationStatus.REGISTERED,
			});

			const answers = [
				{ key: "nombre_joven", value: names[Math.floor(Math.random() * names.length)] },
				{ key: "apellido_joven", value: lastnames[Math.floor(Math.random() * lastnames.length)] },
				{ key: "genero", value: Math.random() > 0.5 ? "Masculino" : "Femenino" },
				{ key: "fecha_nacimiento", value: "2008-05-15" },
				{ key: "edad", value: String(Math.floor(14 + Math.random() * 6)) },
				{ key: "comunidad", value: "Barrio San Francisco" },
				{ key: "nombre_tutor", value: names[Math.floor(Math.random() * names.length)] },
				{ key: "apellido_tutor", value: lastnames[Math.floor(Math.random() * lastnames.length)] },
				{ key: "telefono_tutor", value: "9641112222" },
				{ key: "enfermedad", value: "Ninguna" },
				{ key: "tratamiento", value: "Ninguno" },
				{ key: "observaciones", value: "Prueba de sistema" },
			];

			const valuesToCreate = answers
				.map((ans) => {
					const f = fields.find((field) => field.key === ans.key);
					return f
						? {
							registrationId: registration.id,
							eventFieldId: f.id,
							eventId: event.id,
							value: ans.value,
						}
						: null;
				})
				.filter((v): v is NonNullable<typeof v> => v !== null);

			await createDemoRegistrationFieldValues(valuesToCreate);
		}
	}

	console.log("✅ SEED COMPLETADO: Sistema listo para pruebas con multienfoque.");

	return {
		slug: event.slug,
		eventId: event.id,
		resetPerformed,
		demoEditorEmail: mainEditorEmail,
		mainUser: {
			email: mainEditorEmail,
			password: mainEditorPassword,
		},
		teamPasswords: commonPassword,
	};
}
