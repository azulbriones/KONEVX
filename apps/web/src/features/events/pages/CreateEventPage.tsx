import { useCreateEvent } from "@/features/events/hooks/useEvents";
import { useNavigate } from "react-router-dom";
import { EventForm } from "../components/EventForm";
import type { CreateEventInput } from "../types";
import { prepareEventFormData } from "../utils/eventFormData";

export const CreateEventPage = () => {
  const navigate = useNavigate();
  const createMutation = useCreateEvent();

  const handleCreate = (values: CreateEventInput) => {
    const {
      isPublished: _isPublished,
      id: _id,
      ...cleanValues
    } = values as CreateEventInput & {
      id?: number;
      isPublished?: boolean;
    };

    const formData = prepareEventFormData(cleanValues);
    createMutation.mutate(formData, {
      onSuccess: (created) =>
        navigate(`/events/${created.id}`, { replace: true }),
    });
  };

  return (
    <EventForm
      onSubmit={handleCreate}
      isPending={createMutation.isPending}
      submitLabel="Crear Evento"
      onCancel={() => navigate("/")}
    />
  );
};
