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
    file.arrayBuffer().then(buffer => {
      fetch(`http://localhost:8080/upload/${uuidv4()}`, {method: 'PUT', body: buffer, headers:{'Content-Type': file.type}}).then(res => {
        if (res.status !== 200) {
          message.error(res.text());
          return;
        }
        message.success(res.text());
      })
    }).catch(err => {
      message.error(err);
    })
    return false
  }

  return <AntdUpload onChange={onChange} beforeUpload={beforeUpload} fileList={files} multiple={true}>
    <div>
      <PlusOutlined rev={false}/>
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
    </AntdUpload>
}