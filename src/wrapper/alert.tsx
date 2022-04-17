import { useState, createContext } from "react";
import { Alert } from "antd";

type AlertMessage = {
	message: string,
	type: "error" | "info" | "warning" | "success",  
} | null

type SetAlertFunc = ((alert: AlertMessage) => void)| null

export const AlertContext = createContext<SetAlertFunc>(null);

export const AlertWrapper = (props: any) => {
	const [alert, setAlert] = useState<AlertMessage>(null);
	return <AlertContext.Provider value={setAlert}>
		{ alert && <Alert type={alert?.type} message={alert?.message} /> }
		{props.children}
	</AlertContext.Provider>
}