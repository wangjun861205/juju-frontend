import React, { useState } from "react";
import { Alert } from "antd";

type AlertMessage = {
	message: string,
	type: "error" | "info" | "warning" | "success",
} | null


export interface AlertProps {
	setAlert: (alert: AlertMessage) => void,
}


export const AlertWrapper = <P extends object>(Component: React.ComponentType<P & AlertProps>) => {
	const WithComponent = (props: P) => {
		const [alert, setAlert] = useState<AlertMessage>(null);
		return <>
			{alert && <Alert type={alert?.type} message={alert?.message} />}
			<Component {...props} setAlert={setAlert} />
		</>
	}
	return WithComponent
}