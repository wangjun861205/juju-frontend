import { Spin } from "antd";
import { useState, createContext} from "react"

export const LoadingContext = createContext<((state: boolean) => void) | null >(null);



export const LoadingWrapper = (props: any) => {
	const [loading, setLoading] = useState(true);
	return <LoadingContext.Provider value={setLoading}>
		<Spin spinning={loading}></Spin>
		{ props.children }
		</LoadingContext.Provider>
}