import { Upload, message, Button, Input, Spin, Slider} from "antd";
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import { useState, useEffect, createRef } from "react";
import { stringify } from "querystring";
import { cursorTo } from "readline";
import { Layout } from "../layout/layout"
import { ReactCrop, Crop } from 'react-image-crop';
import { Profile as ProfileModel } from "../models/profile"
import AvatarEditor from 'react-avatar-editor'
import {v4 as uuidv4} from 'uuid';

const Profile =  () => {
    const [data, setData] = useState<ProfileModel>({nickname: "", avatar: ""});   
    const [scale, setScale] = useState(0);
    const [fileType, setFileType] = useState("")

    useEffect(() => {
        fetch("/profile")
        .then(res => {
            if (res.status !== 200) {
                message.error("failed to load data");
                return
            }
            res.json()
            .then(r => setData(r))
            .catch(e => message.error(e))
        })
        .catch(e => message.error(e))
    }, [])

    const onImageSelected = (e: any) => {
        if (!e.target.files) {
            return
        }
        setFileType(e.target.files[0].type)
        const reader = new FileReader();
        reader.onload = () => {
            setData(curr => {return {...curr, avatar: reader.result as string}})
        };
        reader.readAsDataURL(e.target.files[0]);
    }

    const editorRef = createRef<AvatarEditor>();

    const onSubmit = () => {
        const uid = uuidv4();
        editorRef.current?.getImage().toBlob(blob => {
            fetch(`/upload/${uid}`, {method: "PUT", headers: {"Content-Type": fileType}, body: blob})
            .then(res => {
                if (res.status !== 200) {
                    message.error("failed to upload");
                    return
                }
                setData(curr => {return {...curr, avatar: `/upload/${uid}`}});
            })
            .catch(e => message.error(e))
        })
    }


    return <Layout>
        <Input placeholder="Nickname..." onChange={e => setData(curr => {return { ...curr, nickname: e.target.value }})} />
        <Input type='file' accept="image/*" onChange={onImageSelected}/>
        <AvatarEditor ref={editorRef} image={data.avatar} borderRadius={100} scale={scale} onImageChange={() => {}}/>      
        <Slider style={{width: "200px"}} value={scale} onChange={v => setScale(v)} min={1} max={10} step={0.1} />
        <Button onClick={onSubmit}>Submit</Button>
    </Layout>

}

export default Profile;