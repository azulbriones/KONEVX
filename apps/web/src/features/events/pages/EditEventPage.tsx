import { CircularProgress } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { EventForm } from "../components/EventForm";
import { useEvent, useUpdateEvent } from "../hooks/useEvents";
import { CreateEventInput } from "../types";
import { prepareEventFormData } from "../utils/eventFormData";

export function EditEventPage() {
	const { eventId } = useParams();
	const navigate = useNavigate();
	const { data, isLoading } = useEvent(Number(eventId));
	const updateMutation = useUpdateEvent(Number(eventId));

	const handleUpdate = (values: CreateEventInput) => {
		const { id, createdAt, updatedAt, remaining, ...cleanValues } =
			values as any;

		const formData = prepareEventFormData(cleanValues);

		updateMutation.mutate(formData, {
			onSuccess: () => navigate(`/events/${eventId}`),
		});
	};

	if (isLoading) return <CircularProgress />;

	return (
		<EventForm
			defaultValues={
				data?.event
					? {
							...data.event,
							slogan: data.event.slogan ?? undefined,
							footerDescription:
								data.event.footerDescription ?? undefined,
						}
					: undefined
			}
			onSubmit={handleUpdate}
			isPending={updateMutation.isPending}
			submitLabel="Guardar Cambios"
			onCancel={() => navigate(-1)}
		/>
	);
}
