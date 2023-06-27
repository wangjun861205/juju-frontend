import { Upload, message, Button, Input, Spin, Slider} from "antd";
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import { useState, useEffect, createRef} from "react";
import { useQuery} from "react-query";
import { stringify } from "querystring";
import { cursorTo } from "readline";
import { Layout } from "../layout/layout"
import { ReactCrop, Crop } from 'react-image-crop';
import { Profile as ProfileModel } from "../models/profile"
import AvatarEditor from 'react-avatar-editor'
import {v4 as uuidv4} from 'uuid';
import { useNavigate } from "react-router";

const Profile =  () => {
    const nav = useNavigate();
    const [data, setData] = useState<ProfileModel>({nickname: "", avatar: null});   
    const [scale, setScale] = useState(0);
    const [fileType, setFileType] = useState("")

    const {isLoading, error, data: queryData} = useQuery("profile", async () => {
        const res = await fetch("/profile");
        if (res.status !== 200) {
            message.error("failed to load data");
            return Promise.reject("failed to load data")
        }
        return res.json();
    });


    useEffect(() => {
        if (isLoading) {
            return
        }
        setData(queryData);
    }, [queryData])



    if (error) {
        return <Layout>
            <h1>failed to load data</h1>
        </Layout>
    }

    if (isLoading) {
        return <Layout>
            <Spin spinning={true} size="large"/>
        </Layout>
    }


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

    const onSubmit = async () => {
        const uid = uuidv4();
        editorRef.current?.getImage().toBlob(async blob => {
            await fetch(`/upload/${uid}`, {method: "PUT", headers: {"Content-Type": fileType}, body: blob});
            const res = await fetch(`/profile`, {method: "PUT", headers: {"Content-Type": "application/json"}, body: JSON.stringify({nickname: data.nickname, avatar: `/upload/${uid}`})});
            if (res.status !== 200) {
                message.error("failed to update");
                return
            }
            message.success("successfully updated");
            nav(-1);
        })
    }


    return <Layout>
            <Input placeholder="Nickname..." onChange={e => setData(curr => {return { ...curr, nickname: e.target.value }})} />
            <Input type='file' accept="image/*" onChange={onImageSelected}/>
            <AvatarEditor ref={editorRef} image={data.avatar ?? ""} borderRadius={100} scale={scale} onImageChange={() => {}}/>      
            <Slider style={{width: "200px"}} value={scale} onChange={v => setScale(v)} min={1} max={10} step={0.1} />
            <Button type="primary" onClick={onSubmit}>Submit</Button>
        </Layout>

}

export default Profile;