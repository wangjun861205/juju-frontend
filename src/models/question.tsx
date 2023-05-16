import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Option as OptItem } from "./opt";
import { get, delete_ } from "../utils/api";
import { Table, Button } from "antd";
import { Create as OptionCreate, Option } from "./opt"

export enum QuestionType {
  SINGLE = 'SINGLE',
  MULTI = 'MULTI'
}

export type Question = {
  id: number,
  description: string,
  type_: QuestionType,
  version: number,
  options: Option[],
}

export type ListItem = {
  id: number,
  description: string,
  hasAnswered: boolean,
}

export type Create = {
  description: string,
  type_: QuestionType,
  options: OptionCreate[],
}

export type Detail = {
  id: number,
  description: string,
  type_: string,
  opts: OptItem[],
}

export type Update = {
  description: string,
  type_: QuestionType,
}

type Item = {
  id: number,
  description: string,
  has_answered: boolean,
}

export const List = ({ vote_id }: { vote_id: string }) => {
  const nav = useNavigate();
  const [data, setData] = useState<Item[]>([]);
  useEffect(() => {
    get<Item[]>(`/votes/${vote_id}/questions`).then(res => {
      setData(res);
    }).catch(reason => {
      console.log(reason);
    });
  });

  const deleteQuestion = (id: number, idx: number) => {
    delete_<{ deleted: number }>(`/questions/${id}`).then(res => {
      if (res.deleted > 0) {
        const newData = [...data];
        newData.splice(idx, 1);
        setData(newData);
      }
    }).catch(
      reason => {
        console.log(reason);
      }
    )
  }

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Has Answered",
      dataIndex: "has_answered",
      key: "has_answered",
    },
    {
      title: "Actions",
      render: (_: any, item: Item, i: number) => {
        return <div>
          <Button onClick={(event) => { event.stopPropagation(); nav(`/questions/${item.id}/update`); }}>Update</Button>
          <Button onClick={(event) => { event.stopPropagation(); deleteQuestion(item.id, i) }}></Button>
        </div>
      }
    }
  ];

  <Table columns={columns} dataSource={data} onRow={(item) => { return { onClick: () => { nav(`/questions/${item.id}`) } } }} />
}