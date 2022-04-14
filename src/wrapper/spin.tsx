import { Spin } from "antd";
import { useState, FunctionComponent } from "react"


export const LoadingWrapper = ({ Inner }: { Inner: FunctionComponent<{ setLoading: (loading: boolean) => void }> }) => {
	const [loading, setLoading] = useState(true);
	return <div>
		<Spin spinning={loading}></Spin>
		<Inner setLoading={setLoading} />
	</div>
}