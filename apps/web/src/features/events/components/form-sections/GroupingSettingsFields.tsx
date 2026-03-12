import {
	Alert,
	Box,
	Divider,
	FormControl,
	FormControlLabel,
	FormHelperText,
	Grid,
	InputLabel,
	MenuItem,
	Select,
	Switch,
	TextField,
	Typography,
} from "@mui/material";
import { useEffect } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { useParams } from "react-router-dom";
import { useEventFields } from "../../hooks/useEventFields";

export function GroupingSettingsFields({ disabled }: { disabled?: boolean }) {
	const { control, setValue, getValues } = useFormContext();
	const { eventId } = useParams();
	const isEditMode = Boolean(eventId && !isNaN(Number(eventId)));

	const { data: fields } = useEventFields(isEditMode ? Number(eventId) : 0);

	const allFields = Array.isArray(fields)
		? fields
		: (fields as any)?.items || [];
	const selectFields =
		allFields.filter((f: any) => f.type === "SELECT") || [];

	const enabled = useWatch({ control, name: "groupingSettings.enabled" });
	const customFieldId = useWatch({
		control,
		name: "groupingSettings.customFieldId",
	});
	const hasSubgroups = useWatch({
		control,
		name: "groupingSettings.hasSubgroups",
	});

	useEffect(() => {
		if (customFieldId) {
			const selectedField = selectFields.find(
				(f: any) => f.id === customFieldId,
			);
			if (selectedField && Array.isArray(selectedField.options)) {
				const currentDistribution =
					getValues("groupingSettings.distribution") || {};
				const newDistribution: any = {};

				selectedField.options.forEach((opt: string) => {
					newDistribution[opt] = currentDistribution[opt] || {
						prefix: "",
						subgroupsCount: 1,
					};
				});

				setValue("groupingSettings.distribution", newDistribution);
			}
		}
	}, [customFieldId]);

	const selectedField = selectFields.find((f: any) => f.id === customFieldId);

	return (
		<Grid container spacing={3} sx={{ width: "100%" }}>
			<Grid item xs={12}>
				<Typography
					variant="subtitle1"
					fontWeight={700}
					color="primary"
					sx={{ mt: 1 }}
				>
					Agrupación y Asignación Automática
				</Typography>
				<Divider sx={{ my: 1 }} />
			</Grid>
			<Grid item xs={12}>
				<Typography variant="body2" color="text.secondary" gutterBottom>
					Configura si deseas que el sistema asigne automáticamente
					habitaciones o equipos basándose en las respuestas del
					formulario.
				</Typography>
			</Grid>
			{!isEditMode ? (
				<Alert severity="info" sx={{ mt: 2 }}>
					Para configurar la agrupación automática, primero debes
					guardar el evento y crear un campo de tipo "Selector Único"
					(ej: Género, Categoría).
				</Alert>
			) : (
				<>
					<Grid item xs={12}>
						<Box mt={2}>
							<Controller
								name="groupingSettings.enabled"
								control={control}
								defaultValue={false}
								render={({ field }) => (
									<FormControlLabel
										control={
											<Switch
												{...field}
												checked={!!field.value}
												disabled={disabled}
											/>
										}
										label="Habilitar Agrupación Automática"
									/>
								)}
							/>
						</Box>
					</Grid>
					{enabled && (
						<Grid item xs={12}>
							<Box
								mt={3}
								p={2}
								bgcolor="background.default"
								borderRadius={2}
							>
								{selectFields.length === 0 ? (
									<Alert severity="warning">
										No tienes campos de tipo "Selector
										Único". Ve a la pestaña de "Formulario"
										para crearlos.
									</Alert>
								) : (
									<Grid container spacing={3}>
										{/* Selector de Campo */}
										<Grid item xs={12} md={6}>
											<Controller
												name="groupingSettings.customFieldId"
												control={control}
												defaultValue=""
												render={({
													field,
													fieldState: { error },
												}) => (
													<FormControl
														fullWidth
														error={!!error}
														disabled={disabled}
													>
														<InputLabel>
															Campo Base (Select)
														</InputLabel>
														<Select
															{...field}
															label="Campo Base (Select)"
														>
															<MenuItem value="">
																<em>
																	Seleccione
																	un campo
																</em>
															</MenuItem>
															{selectFields.map(
																(f: any) => (
																	<MenuItem
																		key={
																			f.id
																		}
																		value={
																			f.id
																		}
																	>
																		{
																			f.label
																		}
																	</MenuItem>
																),
															)}
														</Select>
														{error && (
															<FormHelperText>
																{error.message}
															</FormHelperText>
														)}
													</FormControl>
												)}
											/>
										</Grid>

										{/* Switch Subgrupos */}
										<Grid item xs={12} md={6}>
											<Controller
												name="groupingSettings.hasSubgroups"
												control={control}
												defaultValue={false}
												render={({ field }) => (
													<FormControlLabel
														control={
															<Switch
																{...field}
																checked={
																	!!field.value
																}
																disabled={
																	disabled ||
																	!customFieldId
																}
															/>
														}
														label="Dividir en subgrupos (ej: Varios cuartos)"
														sx={{ mt: 1 }}
													/>
												)}
											/>
										</Grid>

										{/* Inputs Dinámicos */}
										{customFieldId &&
											selectedField &&
											Array.isArray(
												selectedField.options,
											) && (
												<Grid item xs={12}>
													<Typography
														variant="subtitle2"
														gutterBottom
														mt={2}
													>
														Distribución
													</Typography>

													{selectedField.options.map(
														(option: string) => (
															<Box
																key={option}
																sx={{
																	display:
																		"flex",
																	gap: 2,
																	alignItems:
																		"center",
																	mb: 2,
																	p: 2,
																	border: "1px solid",
																	borderColor:
																		"divider",
																	borderRadius: 1,
																}}
															>
																<Typography
																	sx={{
																		minWidth: 120,
																		fontWeight:
																			"bold",
																	}}
																>
																	{option}
																</Typography>
																<Controller
																	name={`groupingSettings.distribution.${option}.prefix`}
																	control={
																		control
																	}
																	defaultValue=""
																	render={({
																		field,
																		fieldState:
																			{
																				error,
																			},
																	}) => (
																		<TextField
																			{...field}
																			value={
																				field.value ||
																				""
																			}
																			label="Prefijo (Ej: A)"
																			size="small"
																			disabled={
																				disabled
																			}
																			error={
																				!!error
																			}
																			helperText={
																				error?.message
																			}
																		/>
																	)}
																/>

																{hasSubgroups && (
																	<Controller
																		name={`groupingSettings.distribution.${option}.subgroupsCount`}
																		control={
																			control
																		}
																		defaultValue={
																			1
																		}
																		render={({
																			field: {
																				value,
																				onChange,
																				...rest
																			},
																			fieldState:
																				{
																					error,
																				},
																		}) => (
																			<TextField
																				{...rest}
																				value={
																					value
																				}
																				onChange={(
																					e,
																				) => {
																					const val =
																						e
																							.target
																							.value;
																					onChange(
																						val ===
																							""
																							? ""
																							: Number(
																									val,
																								),
																					);
																				}}
																				type="number"
																				label="N° de Subgrupos"
																				size="small"
																				disabled={
																					disabled
																				}
																				error={
																					!!error
																				}
																				helperText={
																					error?.message
																				}
																				InputProps={{
																					inputProps:
																						{
																							min: 1,
																						},
																				}}
																				sx={{
																					width: 180,
																				}}
																			/>
																		)}
																	/>
																)}
															</Box>
														),
													)}
												</Grid>
											)}
									</Grid>
								)}
							</Box>
						</Grid>
					)}
				</>
			)}
		</Grid>
	);
}
