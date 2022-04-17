import React, { FC, useState, createContext, useEffect } from "react"; import { Pagination } from "antd";
import { ReactJSXElement } from "@emotion/react/types/jsx-namespace";

export interface PaginationProps {
    page: number,
    size: number,
    setTotal: ((total: number) => void) | null,
};

type Pagination = {
    page: number,
    size: number,
    total: number,
};

export const PaginationContext = createContext<PaginationProps>({page: 1, size: 10, setTotal: null});

export const PaginationWrapper: FC<{}> = ({children}) => {
    const [{page, size, total}, setPagination] = useState<Pagination>({page: 1, size: 10, total: 0});
    const setTotal = (total: number) => { setPagination({page: page, size: size, total: total}) }
    useEffect(() => {}, [page, size])

    return <PaginationContext.Provider value={{page: page, size: size, setTotal: setTotal}} >
                {children}
                <Pagination onChange={(page, size) => {setPagination({page: page, size: size, total: total})}} total={total} />
        </PaginationContext.Provider>
}