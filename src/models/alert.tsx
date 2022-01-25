export type Alert = {
	type: "error" | "info" | "warning" | undefined
	message: string | undefined
}