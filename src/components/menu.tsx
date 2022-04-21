import React, { ReactNode, useState, ReactElement } from "react"


export const Menu = <P extends object>({children, curr, ...other}: React.PropsWithChildren<P> & {curr: ReactElement }) => {
    const [isOpen, setOpen] = useState(false);
    return <div {...other} onMouseEnter={() => { setOpen(true) }} onMouseLeave={() => { setOpen(false) }}>
        { children === null && {curr} || <>{ curr } { isOpen && children }</>}
    </div>
}