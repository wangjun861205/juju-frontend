import { Menu } from 'antd';
import { ComponentType, PropsWithChildren } from 'react';
import {  Link } from 'react-router-dom';
import './sidemenu.css';


export const SideMenu = <P, >({children}: PropsWithChildren<P>) => {
    return <div className='SideMenuContainer'>
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
