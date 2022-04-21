import React, { ReactNode, useState } from "react"


export const Menu = <P extends object>({children, curr}: React.PropsWithChildren<P> & {curr: ReactNode }) => {
    const [isOpen, setOpen] = useState();
    return <>
        { children === null && {curr} || <>{ curr } { isOpen && children }</>}
    </>
}