import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import * as yup from "yup";

import type { EventField, FieldType } from "../../types";
import {
  isDuplicateKey,
  isSelectType,
  isValidSnakeCaseKey,
  optionsToText,
  toOptionsArray,
} from "../utils/fields";

export type Mode = "create" | "edit";

export type FieldDrawerResult = {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[];
};

export type FieldDrawerProps = {
  open: boolean;
  mode: Mode;
  fields: EventField[];
  initial?: EventField | null;
  onClose: () => void;
  onSubmit: (values: FieldDrawerResult) => void;
};

type FormValues = {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  optionsText: string;
};

const getDefaultValues = (): FormValues => ({
  key: "",
  label: "",
  type: "TEXT",
  required: false,
  optionsText: "",
});

export const useFieldDrawerController = ({ open, mode, fields, initial }: FieldDrawerProps) => {
  const schema = useMemo(() => {
    return yup.object({
      key: yup
        .string()
        .required("El Key es requerido")
        .max(80)
        .test("snake", "El Key debe ser snake_case (ej: mi_campo)", (value) =>
          value ? isValidSnakeCaseKey(value) : true,
        )
        .test("dup", "Este Key ya existe", (value) => {
          if (!value) return true;
          return !isDuplicateKey(fields, value, initial?.id);
        }),
      label: yup.string().required("El Label es requerido").max(200),
      type: yup
        .mixed<FieldType>()
        .oneOf(["TEXT", "TEXTAREA", "NUMBER", "DATE", "SELECT", "MULTI_SELECT", "CHECKBOX"])
        .required("Selecciona un tipo de dato"),
      required: yup.boolean().required(),
      optionsText: yup.string().when("type", ([type], schema) => {
        return isSelectType(type as FieldType)
          ? schema.test("has-options", "Debes agregar al menos una opción", (value) => toOptionsArray(value || "").length > 0)
          : schema;
      }),
    });
  }, [fields, initial?.id]);

  const form = useForm<FormValues>({
    resolver: yupResolver(schema) as Resolver<FormValues>,
    defaultValues: getDefaultValues(),
  });

  const { register, handleSubmit, control, watch, reset, formState: { errors } } = form;

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && initial) {
      reset({
        key: initial.key,
        label: initial.label,
        type: initial.type,
        required: initial.required,
        optionsText: optionsToText(initial.options),
      });
      return;
    }

    reset(getDefaultValues());
  }, [initial, mode, open, reset]);

  const watchedType = watch("type");
  const showOptions = isSelectType(watchedType);

  const onFormSubmit = (values: FormValues, onSubmit: FieldDrawerProps["onSubmit"]) => {
    const isSelect = isSelectType(values.type);

    onSubmit({
      key: values.key.trim(),
      label: values.label.trim(),
      type: values.type,
      required: values.required,
      ...(isSelect ? { options: toOptionsArray(values.optionsText) } : {}),
    });
  };

  return {
    register,
    handleSubmit,
    control,
    errors,
    showOptions,
    onFormSubmit,
    mode,
  };
};
