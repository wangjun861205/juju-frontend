import { Avatar } from "antd";
import { Menu } from "./menu"


const MyMenu = () => {
	return <Menu curr={<Avatar shape="circle" src="/Ducati.png" />}>
			<Menu curr="Profile" />
			<Menu curr="Logout" />
	</Menu>
}

export const Navbar = () => {
	return <>
		<MyMenu />
	</>
}