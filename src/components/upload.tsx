import { Upload as AntdUpload, Image, List, Row, UploadFile, UploadProps as AntdUploadProps, message } from 'antd';
import { Dispatch, SetStateAction, useState } from 'react';
import { PlusOutlined} from '@ant-design/icons';
import {v4 as uuidv4} from 'uuid';




export interface UploadProps {
  files: UploadFile[];
  setFiles:  Dispatch<SetStateAction<UploadFile[]>>;
}
export const Upload = ({ files, setFiles }: UploadProps) => {
  const onChange: AntdUploadProps['onChange'] = ({ file, fileList }) => {
    setFiles(fileList);
  }

  const beforeUpload: AntdUploadProps['beforeUpload'] = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      const buffer = reader.result as ArrayBuffer;
      const id = uuidv4();
      fetch(`/upload/${id}`, {method: 'PUT', body: buffer, headers:{'Content-Type': file.type}}).then(res => {
        if (res.status !== 200) {
          message.error(res.text());
          return;
        }
        message.success('successfully uploaded');
        setFiles(prev => {
          const newFiles = [...prev];
          const i = newFiles.findIndex((f) => f.uid === file.uid);
          if (i !== -1) {
            newFiles[i].url = `/upload/${id}`;
          }
          return newFiles
        });
      })
    }
    reader.readAsArrayBuffer(file);
    return false
  }

  return <AntdUpload onChange={onChange} beforeUpload={beforeUpload} fileList={files} multiple={true} listType="picture-card">
    <div>
      <PlusOutlined rev={false}/>
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
    </AntdUpload>
}