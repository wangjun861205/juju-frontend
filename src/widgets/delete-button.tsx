import {Button, Modal, message} from "antd";
import { BaseButtonProps } from "antd/lib/button/button";
import { useState } from "react";

interface DeleteButtonProps {
    content: string,
    deleteURL: string,
}
export const DeleteButton = ({content, deleteURL, ...others}: DeleteButtonProps & BaseButtonProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const onOk = (e: any) => {
            e.preventDefault();
            e.stopPropagation();
            fetch(deleteURL, {method: "DELETE"}).then(res => {
                if (res.status != 200) {
                    res.text()
                    .then(e =>  message.error(e))
                    .catch(e => message.error(e))
                    setIsOpen(false);
                    return
                }
                message.success("Successfully deleted")
                setIsOpen(false);
            })
    }
    const onCancel = (e: any) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(false);
    }
    
    return <>
        <Button {...others} disabled={isOpen} danger={true} onClick={(e) => {e.preventDefault(); e.stopPropagation();  setIsOpen(true) }}>Delete</Button>
        <Modal open={isOpen} okText='Delete' okType='danger' cancelText='Cancel' closable={true} onOk={onOk} onCancel={onCancel}>{content}</Modal>
    </>
    
}