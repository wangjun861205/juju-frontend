import { Avatar } from "antd";
import { Menu } from "./menu";
import "./navbar.css";


const ProfileMenu = () => {
	return <Menu className="profile-menu" curr={<Avatar size="large" shape="circle" src="/Ducati.png" />}>
			<Menu curr={<div onClick={(e) => { e.stopPropagation(); alert("Profile"); }} >Profile</div>} > 
				<Menu curr={<div onClick={ (e) => { e.stopPropagation(); alert("Sub1")}}>Sub1</div>} />
			</Menu>
			<Menu curr={<div onClick={(e) => { e.stopPropagation(); alert("Logout")}}>Logout</div>} />
	</Menu>
}

export const Navbar = () => {
	return <div className="navbar">
		<ProfileMenu />
	</div>
}