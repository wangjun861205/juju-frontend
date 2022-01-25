import { Input, Button, Alert } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router";

const Login = () => {
	const [data, setData] = useState({
		username: "",
		password: "",
	});
	const [alert, setAlert] = useState("");
	const nav = useNavigate();

	const login = async () => {
		const res = await fetch("/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		});
		if (res.status !== 200) {
			setAlert(res.statusText);
			setTimeout(() => {
				setAlert("");
			}, 2000);
			return
		}
		nav("/organizations")
	}

	return <div>
		{alert !== "" && <Alert message={alert} type="error" banner={true} closable={true} />}
		<Input placeholder="Username..." onChange={(e) => { setData({ ...data, username: e.target.value }) }} />
		<Input type="password" placeholder="Password..." onChange={(e) => { setData({ ...data, password: e.target.value }) }} />
		<Button onClick={() => { login().catch((e) => { console.log(e) }) }}>Login</Button>
	</div>
}

export default Login;