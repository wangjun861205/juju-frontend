import { Upload as AntdUpload, Image, List, Row } from 'antd';
import { Dispatch, SetStateAction } from 'react';


export interface UploadProps {
  images: string[],
  setImages: Dispatch<SetStateAction<string[]>>,
}
export const Upload = ({ images, setImages }: UploadProps) => {
  return <>
    <Row>{images.map(data => <Image src={`data:image/jpeg;base64,${data}`} />)}</Row>
    <AntdUpload accept='image/jpeg,image/png' beforeUpload={file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result?.toString();
        content && setImages((prev) => {
          const l = [...prev];
          l.push(content);
          return l;
        })
      }
      reader.readAsDataURL(file);
      return false
    }} />
  </>
}