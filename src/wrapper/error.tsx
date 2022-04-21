import React, { useState } from "react";
import { ErrForbidden } from "../errors";
import Login from "../pages/login";
import { Alert } from "antd";

export interface ErrorProps {
	setError: (error: Error) => void,
}

export const ErrorWrapper = <P extends object>(Component: React.ComponentType<P & ErrorProps>) => {
	const WithError = (props: P) => {
		const [error, setError] = useState<Error | null>(null);
		switch (error) {
			case null:
				return <Component {...props} setError={setError} />
			case ErrForbidden:
				return <Login />
			default:
				setTimeout(() => setError(null), 3000);
				return <>
					<Alert type="error" message={`${error}`} />
					<Component {...props} setError={setError} />
				</>

		}
	};
	return WithError
}