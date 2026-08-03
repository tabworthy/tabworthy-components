export const formatDateError = (label, date) => typeof label === "function" ? label(date) : `${label} ${date}`;
