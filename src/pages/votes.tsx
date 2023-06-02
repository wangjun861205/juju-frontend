import Calendar from "../components/calendar"
import { Input, Button, Alert, Table, Pagination, Select, message, Steps, Row, Descriptions, Card, Grid, Divider, Col, List } from "antd";
import { useState, useEffect, useCallback, Dispatch, SetStateAction } from "react";
import { useNavigate, useParams } from "react-router";
import { Detail as VoteDetail } from "../models/vote";
import { Alert as AlertModel } from "../models/alert";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker
} from '@material-ui/pickers';
import 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import { get, post, fetch_list } from "../utils/api";
import { _Report, Report as QuestionReport, List as CQuestionList, ListForCreate as QuestionListForCreateComponent, Create as QuestionCreate } from "../components/questions";
import { Moment } from "moment";
import { DatePicker } from "antd";
import { Detail as CVoteDetail, Update as CVoteUpdate, Filling as FillingComponent } from "../components/vote";
import { Layout } from "../layout/layout";
import { Create as CreateVoteComponent } from "../components/vote";
import { Create as VoteCreateModel } from "../models/vote";
import { QuestionType, Create as QuestionCreateModel, Question } from "../models/question";
import { GridList } from "@material-ui/core";


export type Vote = {
  id: number,
  name: string,
  deadline: string | null | undefined,
}

type Creation = {
  name: string,
  deadline: Moment | null,
}

type CreationResponse = {
  id: number,
}

export const CreateVote = () => {
  const { organization_id } = useParams();
  const nav = useNavigate();
  const [current, setCurrent] = useState(0);
  const [vote, setVote] = useState<VoteCreateModel>({ name: "", deadline: null, visibility: 'Organization', questions: [], organization_id: parseInt(organization_id!) });
  const [isQuestionOpen, setIsQuestionOpen] = useState(false);
  const [imageSet, setImageSet] = useState<string[][]>([]);

  const create = () => {
    fetch(`/organizations/${organization_id}/votes`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(vote) }).then(res => {
      if (res.status !== 200) {
        res.text().then(e => message.error(e)).catch(e => message.error(e));
        return;
      }
      nav(`/organizations/${organization_id}/votes`);
    })
  }

  const setQuestions = (questions: QuestionCreateModel[]) => {
    setVote(prev => ({ ...prev, questions: questions }))
  }


  const addQuestionButtonStyle = {
    marginBottom: "30px",
  }

  const steps = [
    {
      title: "Create a Vote",
      content: (<CreateVoteComponent className="m-[20%] h-[40%] flex flex-wrap flex-col justify-evenly" data={vote} setData={setVote} />)
    },
    {
      title: "Add Some Questions",
      content: (<div className="relative mt-[15%]">
        <Button className="mb-10 ml-5" type='primary' onClick={() => setIsQuestionOpen(true)}>Add a Question</Button>
        <QuestionCreate isOpen={isQuestionOpen} setIsOpen={setIsQuestionOpen} onOk={(q: Question) => {
          setVote(prev => {
            const questions = [...prev.questions];
            questions.push(q);
            return { ...prev, questions: questions }
          })
        }} />
        <QuestionListForCreateComponent questions={vote.questions} setQuestions={setQuestions} />
      </div>)
    },
    {
      title: "Preview And Publish",
      content: (<div>
        <Card>
          <Descriptions>
            <Descriptions.Item label="Name">{vote.name}</Descriptions.Item>
            <Descriptions.Item label="Deadline">{vote.deadline}</Descriptions.Item>
            <Descriptions.Item label="Visibility">{vote.visibility}</Descriptions.Item>
          </Descriptions>
        </Card>
        <Divider orientation="left">Questions</Divider>
        <Row gutter={16}>
          {vote.questions.map(q => (
            <Col span={8}>
              <Card>
                <Descriptions style={{ display: "flex" }} >
                  <Descriptions.Item style={{ display: "flex" }} label="Description">{q.description}</Descriptions.Item>
                  <Descriptions.Item style={{ display: "flex" }} label="Type">{q.type_}</Descriptions.Item>
                </Descriptions>
                <List bordered={true}>
                  {q.options.map(o => (<List.Item>{o.option}</List.Item>))}
                </List>
              </Card>
            </Col>))}
        </Row>
      </div>)
    }
  ]

  const items = steps.map(v => ({ title: v.title, key: v.title }))


  return <Layout>
      <Steps className="w-full m-15" current={current} items={items} />
      {steps[current].content}
      {current > 0 && <Button className="absolute left-[10%] bottom-[10%]" onClick={() => setCurrent(prev => prev - 1)}>Previous</Button>}
      {current < items.length - 1 && <Button className="absolute right-[10%] bottom-[10%]" onClick={() => setCurrent(prev => prev + 1)} type='primary'>Next</Button>}
      {current === steps.length - 1 && <Button type='primary' onClick={create}>Publish</Button>}
  </Layout>
}

export const VoteList = () => {
  const { organization_id } = useParams();
  const [data, setData] = useState({ list: [], total: 0, page: 1, size: 10, alert: "" });
  const nav = useNavigate();
  const fetchData = async () => {
    const res = await fetch(`/organizations/${organization_id}/votes?` + new URLSearchParams({ page: data.page.toString(), size: data.size.toString() }));
    if (res.status !== 200) {
      setData({ ...data, alert: res.statusText });
      setTimeout(() => {
        setData({ ...data, alert: "" });
      }, 2000);
      return
    }
    const { list, total } = JSON.parse(await res.text());
    setData({ ...data, list: list, total: total });
  }
  useEffect(() => {
    fetchData().catch((reason) => {
      setData({ ...data, alert: reason });
    });
  }, [data.page, data.size])

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Has Updated",
      dataIndex: "has_updated",
      key: "has_updated",
    },
    {
      title: "Actions",
      dataIndex: "",
      key: "",
      render: (record: { id: number }) => {
        return <>
          <Button onClick={(event) => { event.stopPropagation(); nav(`/organizations/${organization_id}/votes/${record.id}/update`) }}>Update</Button>
          <Button onClick={() => { nav(`/votes/${record.id}/filling`) }}>Filling</Button>
        </>
      }
    }

  ]

  return <div>
    <Layout>
      {data.alert !== "" && <Alert type="error" message={data.alert} banner={true} />}
      <Button onClick={() => { nav(`/organizations/${organization_id}/create_vote`) }}>Add</Button>
      <Table dataSource={data.list} columns={columns} />
      <Pagination pageSize={data.size} current={data.page} total={data.total} />
    </Layout>
  </div>

}




export const Detail = () => {
  const nav = useNavigate();
  const { vote_id } = useParams();


  return <div>
    <Button onClick={() => { nav(-1) }}>Back</Button>
    <CVoteDetail id={vote_id!} />
    {/* <DateRangeUpdate vote_id={vote_id!} /> */}
    <Button onClick={() => { nav(`/votes/${vote_id}/questions/create`) }}>Add Question</Button>
    <CQuestionList vote_id={vote_id!} />
  </div>
}


export const Update = () => {
  const { vote_id } = useParams();
  const nav = useNavigate();
  return <div>
    <Button onClick={() => nav(-1)}>Back</Button>
    <CVoteUpdate id={vote_id!} />
  </div>
}

export const Report = () => {
  const nav = useNavigate();
  const { vote_id } = useParams();
  const [questionReport, setQuestionReport] = useState<_Report[]>([]);
  useEffect(() => {
    get<_Report[]>(`/votes/${vote_id}/questions/report`, { onForbidden: () => { nav("/login") } }).then(r => setQuestionReport(r)).catch(reason => console.log(reason));
  }, [])
  return <div>
    <Button onClick={() => { nav(-1) }}>Back</Button>
    {/* <DateReport vote_id={vote_id!} /> */}
    {questionReport.map(r => <QuestionReport report={r} />)}
  </div>
}

export const Filling = () => {
  const { vote_id } = useParams();
  const nav = useNavigate();
  const [questionIDs, setQuestionIDs] = useState<number[]>([]);
  const [answers, setAnswers] = useState<number[][]>([]);
  const [currIdx, setCurrIdx] = useState<number | null>(null);

  const setValue = useCallback((vals: number[]) => {
    setAnswers(old => {
      if (currIdx === null) {
        return old;
      }
      old[currIdx] = vals;
      return Array.from(old);
    });
  }, [currIdx]);

  const fetchQuestionIDs = async () => {
    const res = await fetch(`/votes/${vote_id}/questions`);
    switch (res.status) {
      case 401:
        nav(`/organizations`);
        throw new Error('unauthorized');
      case 200:
        const { list }: { list: { id: number }[] } = await res.json();
        return list.map((q: { id: number }) => { return q.id });
      default:
        throw new Error(await res.text());
    }
  }

  useEffect(() => {
    fetchQuestionIDs().then(ids => setQuestionIDs(ids)).catch(e => message.error(e));
  }, [])

  useEffect(() => {
    if (!questionIDs) {
      nav(-1);
      return
    }
    setAnswers(new Array(questionIDs.length));
    setCurrIdx(0);
  }, [questionIDs, nav])




  return <>{questionIDs.length > 0 && currIdx !== null && answers && vote_id
    ? <div>
      <FillingComponent id={parseInt(vote_id)} />
    </div>
    : <div></div>}</>
}