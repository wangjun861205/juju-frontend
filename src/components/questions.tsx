import { useState, useEffect } from "react";
import { get, put, ListResponse, delete_, DeleteResponse } from "../utils/api";
import { Button, Checkbox, Input, message, Radio, RadioChangeEvent, Row, Select, Table } from "antd";
import { useNavigate } from "react-router";
import "antd/dist/antd.css";
import { RadioGroup } from "@material-ui/core";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { QuestionType } from "../models/question";
import { Option } from "../models/opt";
import { Create as AnswerCreate } from "../models/answer";
import { Question } from "../models/question";
import { question_with_options_and_answers } from "../apis/question";

type Item = {
  id: number,
  description: string,
  has_answered: boolean,
}

export const List = ({ vote_id }: { vote_id: string }) => {
  const [state, setState] = useState<ListResponse<Item>>({ list: [], total: 0 });
  const nav = useNavigate();
  useEffect(() => {
    get<ListResponse<Item>>(`/votes/${vote_id}/questions`).then((res) => {
      setState(res);
    }).catch(reason => { console.log(reason) });
  }, [vote_id]);

  const _delete = (item: Item, i: number) => {
    delete_<DeleteResponse>(`/questions/${item.id}`).then(res => {
      const newList = [...state.list];
      newList.splice(i, 1);
      setState({ list: newList, total: state.total - 1 })

    }).catch(reason => {
      console.log(reason);
    });
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
      render: (result: boolean) => { return result.toString() }
    },
    {
      title: "Has Updated",
      dataIndex: "has_updated",
      key: "has_updated",
      render: (result: boolean) => { return result.toString() }
    },
    {
      title: "Actions",
      render: (_: any, record: Item, i: number) => {
        return <div>
          <Button onClick={(event) => { event.stopPropagation(); nav(`/questions/${record.id}/update`); }}>Update</Button>
          <Button onClick={(event) => { event.stopPropagation(); _delete(record, i) }}>Delete</Button>
        </div>
      }
    }
  ]

  return <Table columns={columns} dataSource={state.list} onRow={(item: Item) => {
    return {
      onClick: () => {
        nav(`/questions/${item.id}`);
      }
    }
  }} />
}

type QuestionDetail = {
  id: number,
  description: string,
  type_: "Single" | "Multi",
}

export const Detail = ({ question_id }: { question_id: string }) => {
  const [state, setState] = useState<QuestionDetail>();
  useEffect(() => {
    get<QuestionDetail>(`/questions/${question_id}`).then(resp => {
      setState(resp);
    }).catch(reason => { throw reason })
  }, [question_id]);

  return <div>
    <p><label>ID: </label> {state?.id}</p>
    <p><label>Description: </label> {state?.description}</p>
    <p><label>Type: </label>{state?.type_}</p>
  </div >
}

type QuestionUpdate = {
  description: string,
  type_: "Single" | "Multi",
}




export const Update = (props: { onError: (err: Error) => void, question_id: string }) => {
  const [state, setState] = useState<QuestionUpdate>();
  useEffect(() => {
    get<QuestionUpdate>(`/questions/${props.question_id}`).then(resp => {
      setState(resp);
    }).catch(reason => props.onError(reason));
  });
  const update = () => {
    put(`/questions/${props.question_id}`, { body: state }).then().catch(reason => props.onError(reason));
  }

  return <div>
    <Input value={state?.description} onChange={(event) => { setState({ ...state!, description: event.target.value }) }} />
    <Select options={[{ label: "Single", value: "Single" }, { label: "Multi", value: "Multi" }]} onChange={(event) => { setState({ ...state!, type_: event.target.value }) }} />
    <Button onClick={update}>Update</Button>
  </div>
}

type QuestionCreate = {
  description: string,
  type_: "Single" | "Multi",
}

export const Create = (props: { onError: (err: Error) => void, question: QuestionCreate, setQuestion: (question: QuestionCreate) => void }) => {
  return <div>
    <Input value={props.question.description} placeholder="Description" onChange={(event) => { props.setQuestion({ ...props.question, description: event.target.value }) }} />
    <Select options={[{ label: "Single", value: "Single" }, { label: "Multi", value: "Multi" }]} value={props.question.type_} onChange={(value) => { props.setQuestion({ ...props.question, type_: value }) }} />
  </div>

}

export type _Report = {
  question: string,
  options: {
    option: string,
    percentage: number,
  }[],
}

export const Report = ({ report }: { report: _Report }) => {
  return <div>
    <h2>{report.question}</h2>
    {report.options.map(o => {
      return <li><span>{o.option}</span><span>{o.percentage / 100}%</span></li>
    })}
  </div>
}

export type FillingProps = {
  question_id: number,
}





export const Filling = ({ question_id }: FillingProps) => {

  type _Question = Question & { options: Option[] } & { answers: AnswerCreate[] };

  const [question, setQuestion] = useState<_Question>();

  const nav = useNavigate();

  useEffect(() => {
    question_with_options_and_answers(question_id).then(q => {
      setQuestion(q);
    }).catch(e => {
      message.error(e);
      nav(-1)
    });
  }, [question_id, nav])

  const radioOnChange = (e: RadioChangeEvent) => {
    setQuestion(q => {
      if (!q) throw new Error("question still be uninitiated");
      if (q.answers.length === 0) {
        q.answers.push({ option_id: e.target.value });
        return q;
      }
      q.answers[0] = { option_id: e.target.value };
      return q;
    })
  }

  const checkboxOnChange = (e: CheckboxChangeEvent) => {
    setQuestion(q => {
      if (!q) throw new Error("question still be uninitiated");
      if (e.target.checked) {
        q.answers.push({ option_id: e.target.value });
        return q;
      }
      q.answers.splice(q.answers.indexOf({ option_id: e.target.value }), 1);
      return q
    });
  }
  return <>{question ?
    <div>
      <Row>ID: {question.id}</Row>
      <Row>Description: {question.description}</Row>
      <Row>Type: {question.type_}</Row>
      <Row>Version: {question.version}</Row>
      <Row>Options:</Row>
      {question.type_ === QuestionType.SINGLE
        ? <Radio.Group value={question.answers?.[0].option_id}> {question?.options.map(o => { return <Row><Radio value={o.id} onChange={radioOnChange}>{o.option}</Radio></Row> })}</Radio.Group>
        : <Checkbox.Group value={question.answers.map(a => a.option_id)}> {question?.options.map(o => { return <Checkbox value={o.id} onChange={checkboxOnChange}>{o.option}</Checkbox> })}</Checkbox.Group>}
    </div>
    : <></>}</>
}