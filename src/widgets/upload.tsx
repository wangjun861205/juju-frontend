import { Upload as AntdUpload } from "antd";
import { RcFile, UploadFile } from "antd/es/upload";
import { SetStateAction, Dispatch } from "react";

export interface UploadProps {
    files: Uint8Array[],
    setFiles: Dispatch<SetStateAction<Uint8Array[]>>,
}

export const Upload = ({files, setFiles}: UploadProps) => {
    const beforeUpload = (f: RcFile, fs: RcFile[]) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            event.target?.result
        }
    }
    return <AntdUpload  multiple={true} beforeUpload={(_, fs) => {
        
    }}></AntdUpload>
}