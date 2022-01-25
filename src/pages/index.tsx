import Calendar from "../components/calendar"
import { useRef } from "react";
import { Button, Alert } from "antd";

interface Picker {
	getPickedDates(): Array<string>
}



export default function Index() {
	const ref = useRef<Picker>(null);
	const onClick = async () => {
		try {
			const res = await fetch("/votes/1/dates", {
				method: "POST",
				body: JSON.stringify(ref.current!.getPickedDates()),
			});
			if (res.status !== 200) {
				console.log(res.statusText);
				return
			}
			console.log(res.text());

		} catch (e) {
			alert(e);
		}

	}
	return <div>
		<Calendar ref={ref} />
		<Button onClick={() => {
			onClick();
		}}>更新</Button>
	</div>
}