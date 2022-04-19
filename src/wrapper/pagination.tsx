import React, { useState, createContext } from "react";
import { Pagination } from "antd";

export interface PaginationProps {
    page: number,
    size: number,
    setTotal: ((total: number) => void) | null,
};

type PaginationState = {
    page: number,
    size: number,
    total: number,
};

export const PaginationContext = createContext<PaginationProps>({ page: 1, size: 10, setTotal: null });

export const PaginationWrapper = <P extends object>(Component: React.ComponentType<P & PaginationProps>) => {
    const WithComponent = (props: P) => {
        const [{ page, size, total }, setPagination] = useState<PaginationState>({ page: 1, size: 10, total: 0 });
        const setTotal = (total: number) => { setPagination({ page: page, size: size, total: total }) }
        return <>
            <Component {...props} page={page} size={size} setTotal={setTotal} />
            <Pagination onChange={(page, size) => { setPagination({ page: page, size: size, total: total }) }} total={total} />
        </>
    }
    return WithComponent;

}