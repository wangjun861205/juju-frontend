import { Menu, Avatar } from "antd";


const MyMenu = () => {
	return <Menu>
		<Menu.Item>
			<Avatar shape="circle" src="/Ducati.png" />
		</Menu.Item>
		<Menu.SubMenu>
			<Menu.Item>Profile</Menu.Item>
			<Menu.Item>Logout</Menu.Item>
		</Menu.SubMenu>
	</Menu>
}

export const Navbar = () => {
	return <>
		<MyMenu />
	</>
}