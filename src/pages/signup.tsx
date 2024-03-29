import { Input, Button, Alert, message } from "antd";
import { useState } from "react";
import "./signup.css";
import { useNavigate } from "react-router";


const Signup = () => {
	const [data, setData] = useState({
		nickname: "",
		phone: "",
		email: "",
		password: "",
		invite_code: "",
	});
	const nav = useNavigate();
	const signup = async () => {
		const res = await fetch("/signup", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		});
		if (res.status !== 200) {
			throw await res.text();
		}
	}
	return <div className="SignupWrap">
		<div className="Signup">
		<Input placeholder="Nickname..." onChange={(e) => { setData({ ...data, nickname: e.target.value }) }} />
		<Input placeholder="Phone..." onChange={(e) => { setData({ ...data, phone: e.target.value }) }} />
		<Input placeholder="Email..." onChange={(e) => { setData({ ...data, email: e.target.value }) }} />
		<Input placeholder="Password..." onChange={(e) => { setData({ ...data, password: e.target.value }) }} />
		<Input placeholder="Invite code" onChange={(e) => { setData({ ...data, invite_code: e.target.value }) }} />
		<div className="ButtonRow">
		<Button onClick={() => {
			signup().then( _ => {
				message.success("signup successfully");
				nav('/login');
			}
			).catch((e) => {
				console.log(e)
			});
		}}>Signup</Button>
		<Button onClick={() => {nav("/login")}}>To Login</Button>
		</div>
		</div>
	</div>
}


export default Signup;