import React from "react";
import { Alert } from "antd";
import "antd/dist/antd.css";

export class AlertWrapper extends React.Component<{ duration: number }, { message?: string }> {
	constructor(props: any) {
		super(props);
		this.state = {};
	}

	componentDidCatch(error: any, info: any) {
		this.setState({ message: error.toString() });
		setTimeout(() => {
			const newState = { ...this.state };
			delete newState.message;
			this.setState(newState)
		}, this.props.duration)
	}

	render() {

		return this.state.message ? <div style={{ margin: "auto" }}>{this.state.message}</div> : this.props.children
	}
}