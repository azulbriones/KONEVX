export const prepareEventFormData = (values: any) => {
	const formData = new FormData();

	Object.keys(values).forEach((key) => {
		const val = values[key];

		if (["promotionalVideo", "promotionalImages", "logo", "backgroundImage", "heroImage", "groupingSettings"].includes(key)) {
			return;
		}

		if (val !== undefined && val !== null) {
			formData.append(key, val);
		}
	});

	if (values.logo && typeof values.logo !== "string" && values.logo.length > 0) {
		formData.append("logo", values.logo[0]);
	}

	if (values.promotionalVideo && typeof values.promotionalVideo !== "string" && values.promotionalVideo.length > 0) {
		formData.append("promotionalVideo", values.promotionalVideo[0]);
	}

	if (values.promotionalImages && typeof values.promotionalImages !== "string" && values.promotionalImages.length > 0) {
		Array.from(values.promotionalImages).forEach((file: any) => {
			formData.append("promotionalImages", file);
		});
	}

	if (values.backgroundImage && typeof values.backgroundImage !== "string" && values.backgroundImage.length > 0) {
		formData.append("backgroundImage", values.backgroundImage[0]);
	}

	if (values.heroImage && typeof values.heroImage !== "string" && values.heroImage.length > 0) {
		formData.append("heroImage", values.heroImage[0]);
	}

	if (values.groupingSettings) {
		formData.append("groupingSettings", JSON.stringify(values.groupingSettings));
	}

	return formData;
};
