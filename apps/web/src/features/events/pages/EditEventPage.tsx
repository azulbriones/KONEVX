import { CircularProgress } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { EventForm } from "../components/EventForm";
import { useEvent, useUpdateEvent } from "../hooks/useEvents";
import type { CreateEventInput } from "../types";
import { prepareEventFormData } from "../utils/eventFormData";

export const EditEventPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useEvent(Number(eventId));
  const updateMutation = useUpdateEvent(Number(eventId));

  const handleUpdate = (values: CreateEventInput) => {
    const {
      id: _id,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      remaining: _remaining,
      ...cleanValues
    } = values as CreateEventInput & {
      id?: number;
      createdAt?: string;
      updatedAt?: string;
      remaining?: number;
    };

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
              footerDescription: data.event.footerDescription ?? undefined,
            }
          : undefined
      }
      onSubmit={handleUpdate}
      isPending={updateMutation.isPending}
      submitLabel="Guardar Cambios"
      onCancel={() => navigate(-1)}
    />
  );
};
