import { Spin } from "antd";
import React, { useState, createContext, Dispatch, SetStateAction } from "react"

export const LoadingContext = createContext<Dispatch<SetStateAction<boolean>> | null>(null);

export interface LoadingProps {
	setLoading: (loading: boolean) => void,
}


export const LoadingWrapper = <P,>(Component: React.ComponentType<P>) => {

	const WithComponent = (props: P) => {
		const [loading, setLoading] = useState(false);
		return <LoadingContext.Provider value={setLoading}>
			<Spin spinning={loading}>
				<Component {...props} as P/>
			</Spin>
		</LoadingContext.Provider>
	}
	return WithComponent
}