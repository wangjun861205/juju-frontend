import { Input, Button, Alert, Form, message, Row } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router";
import "./login.css";

const Login = () => {
	const [data, setData] = useState({
		username: "",
		password: "",
	});
	const nav = useNavigate();

	const login = () => {
			fetch("/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			}).then(res => {
				if (res.status !== 200) {
					res.text().then(msg => {
						message.error(msg);
					}).catch(e => {
						message.error(e);
					})
					return
				}
				message.success('login successfully')
				nav("/");
			})
	}

	return <div className="LoginWrap">
		<Form className="Login" onFinish={() => login()}>
			<Form.Item><Input autoFocus={true} placeholder="Username..." onChange={(e) => { setData({ ...data, username: e.target.value }) }} /></Form.Item>
			<Form.Item><Input type="password" placeholder="Password..." onChange={(e) => { setData({ ...data, password: e.target.value }) }} /></Form.Item>
			<Row className="ButtonRow">
				<Form.Item><Button type="primary" htmlType="submit">Login</Button></Form.Item>
				<Form.Item><Button onClick={() => { nav("/signup") }}>Signup</Button></Form.Item>
			</Row>
		</Form>
	</div>
}

export default Login