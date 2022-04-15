import { useState, createContext } from "react";
import { Alert } from "antd";

type Alert = {
	message: string,
	kind: "error" | "info" | "debug" | "warning",
}

const AlertContext = createContext<(alert: Alert) => void>();

export const AlertWrapper = (props: any) => {
	const [alert, setAlert] = useState<Alert | null>(null);
	return <AlertContext.Provider value={setAlert}>
		{props.children}
	</AlertContext.Provider>


}