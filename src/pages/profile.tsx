import { Upload, message, Button, Input} from "antd";
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import { useState } from "react";
import { stringify } from "querystring";
import { cursorTo } from "readline";




const Profile =  () => {
    const [data, setData] = useState<{nickname: string, avatar: string}>({nickname: "", avatar: ""});   

    const onChange = ({file: {status, name, response}}: {file: { status: string, name: string, response: string[]}}) => {
        switch (status) {
            case 'uploading': 
                console.log(name);
                break;
            case 'done':
                message.success(name);
                setData((curr) => {
                    return { ...curr, avatar: response[0]};
                })
                break;
            default:
                message.error(name);
        }
    }
    return <>
        <Input placeholder="Nickname..." onChange={e => setData(curr => {return { ...curr, nickname: e.target.value }})} />
        {/* <Upload name="file" action="/upload" onChange={onChange} multiple={true} listType="picture-card">
                <Button icon={<PlusOutlined />}></Button>
        </Upload> */}
        <Button onClick={() => {console.log(data)}}>Submit</Button>
    </>
}

export default Profile;