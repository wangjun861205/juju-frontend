import { MouseEventHandler, PropsWithChildren } from 'react';
import {  Link, useNavigate } from 'react-router-dom';
import { Avatar, Menu, Image, Dropdown, Button, message, Spin} from "antd";
import type { MenuProps } from "antd";
import React, { useState, ReactElement } from "react"
import "./layout.css"
import {useQuery, QueryClientProvider, QueryClient} from "react-query";




const ProfileMenu = () => {
    const nav = useNavigate();
    const {isLoading, error, data, refetch} = useQuery("profile", async () => {
        const res = await fetch("/profile");
        if (res.status !== 200) {
            return Promise.reject("failed to get profile")
        }
        return res.json();

    })
    if (isLoading) {
        return <Spin spinning={true}/>
    }

    if (error) {
        console.error(error);
        return <>
            <h1>Sorry, something went wrong, please try again later</h1>
            <Button onClick={() => refetch()}>Retry</Button>
        </>
    }
    const items: MenuProps['items'] = [
        {
            label: "Profile",
            key: '0',
            onClick: () => {
                nav("/profile");
            },
        },
        {
            type: 'divider',
        },
        {
            label: "Logout",
            key: '1',
            onClick: () => {
                fetch("/logout").then(res => {
                    if (res.status !== 200) {
                        res.text()
                        .then( msg => {
                            message.error(msg)
                        })
                        .catch( e => message.error(e))
                        return
                    }
                    nav("/");
                }).catch(e => message.error(e))
            }
        }
    ] 

    const style: MenuProps['style'] = {
        'width': '150px',
    }
    return      <div className="ProfileMenu">
                    <Dropdown menu={{items, style}} placement='bottomRight'>
                        <Avatar src={data.avatar} shape='circle' size='large'/>
                    </Dropdown>
                </div>

}

export const Navbar = () => {
	return <div className="Navbar">
		<ProfileMenu />
	</div>
}

export const Layout = <P, >({children}: PropsWithChildren<P>) => {
    return <QueryClientProvider client={new QueryClient()}>
                <div className='Outmost'>
                    <Navbar />
                    <div className="Middle">
                        <div className='SideMenu'>
                            <div className='Menu'>
                                <Menu>
                                    <Menu.Item><Link to='/organizations/search'>Organziations</Link></Menu.Item>
                                    <Menu.Item><Link to='/votes/search'>Votes</Link></Menu.Item>
                                    <Menu.Item><Link to='/questions/search'>Questions</Link></Menu.Item>
                                    <Menu.Item><Link to='/answers/search'>Answers</Link></Menu.Item>
                                </Menu>
                            </div>
                        </div>
                        <div className='relative w-[70%] h-[100%]'>
                            { children }
                        </div>
                    </div>
                </div>
            </QueryClientProvider>
}
