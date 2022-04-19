import { Spin } from "antd";
import React, { useState } from "react"


export interface LoadingProps {
	setLoading: (loading: boolean) => void,
}


export const LoadingWrapper = <P extends object>(Component: React.ComponentType<P & LoadingProps>) => {
	const WithComponent = (props: P) => {
		const [loading, setLoading] = useState(true);
		return <>
			<Spin spinning={loading}>
				<Component setLoading={setLoading} {...props} />
			</Spin>
		</>
	}
	return WithComponent
}