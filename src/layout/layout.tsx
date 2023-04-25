import { MouseEventHandler, PropsWithChildren } from 'react';
import {  Link } from 'react-router-dom';
import { Avatar, Menu, Image } from "antd";
import React, { useState, ReactElement } from "react"



const ProfileMenu = () => {
    const [isOpen, setIsOpen] = useState(false);

    const onMouseEnter: MouseEventHandler<HTMLImageElement> = (event) => {
        event.stopPropagation();
        setIsOpen(true);
    }

    const onMouseLeave: MouseEventHandler<HTMLImageElement> = (event) => {
        event.stopPropagation();
        setIsOpen(false);
    }

    return      <div>
                    <Image src="/Ducati.png" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} preview={false}/>
                    <Menu className="profile-menu">
                            <Menu.Item>Profile</Menu.Item>
                            <Menu.Item>Logout</Menu.Item>
                    </Menu>
                </div>
}

export const Navbar = () => {
	return <div className="Navbar">
		<ProfileMenu />
	</div>
}


export const Layout = <P, >({children}: PropsWithChildren<P>) => {
    return <div className='Outmost'>
                <Navbar />
                <div className='SideMenu'>
                    <Menu className='Menu'>
                        <Menu.Item><Link to='/organizations/search'>Organziations</Link></Menu.Item>
                        <Menu.Item><Link to='/votes/search'>Votes</Link></Menu.Item>
                        <Menu.Item><Link to='/questions/search'>Questions</Link></Menu.Item>
                        <Menu.Item><Link to='/answers/search'>Answers</Link></Menu.Item>
                    </Menu>
                </div>
                <div className='Content'>
                    { children }
                </div>
            </div>
}
