import { Input, Button, Alert } from "antd";
import { useState } from "react";
import "antd/dist/antd.css";


const Signup = () => {
	const [data, setData] = useState({
		nickname: "",
		phone: "",
		email: "",
		password: "",
		invite_code: "",
	});
	const [alert, setAlert] = useState("");
	const signup = async () => {
		const res = await fetch("/signup", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		});
		if (res.status !== 200) {
			setAlert(res.statusText);
		}
	}
	return <div>
		{alert !== "" && <Alert message={alert} type="error" banner={true} />}
		<Input placeholder="Nickname..." onChange={(e) => { setData({ ...data, nickname: e.target.value }) }} />
		<Input placeholder="Phone..." onChange={(e) => { setData({ ...data, phone: e.target.value }) }} />
		<Input placeholder="Email..." onChange={(e) => { setData({ ...data, email: e.target.value }) }} />
		<Input placeholder="Password..." onChange={(e) => { setData({ ...data, password: e.target.value }) }} />
		<Input placeholder="Invite code" onChange={(e) => { setData({ ...data, invite_code: e.target.value }) }} />
		<Button onClick={() => {
			signup().catch((e) => {
				console.log(e)
			});
		}}>Signup</Button>
	</div>
}


export default Signup;