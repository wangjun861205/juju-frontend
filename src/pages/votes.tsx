import Calendar from "../components/calendar"
import { Input, Button, Alert, Table, Pagination, Select, message } from "antd";
import { useState, useEffect, useCallback } from "react";
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
import { _Report, Report as QuestionReport, List as CQuestionList } from "../components/questions";
import { Moment } from "moment";
import { DatePicker } from "antd";
import { U as DateRangeUpdate } from "../components/date";
import { Detail as CVoteDetail, Update as CVoteUpdate } from "../components/vote";
import { Report as DateReport } from "../components/date";
import { Filling as FillingComponent } from "../components/questions"


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
  const [data, setData] = useState<Creation>({ name: "", deadline: null });


  const [alert, setAlert] = useState("");
  const nav = useNavigate();

  const create = async () => {
    post<CreationResponse>(`/organizations/${organization_id}/votes`, { body: data }).then((res) => {
      nav(`/organizations/${organization_id}`);
    }).catch(reason => {
      console.log(reason);
    })
  }

  return <div>
    {alert !== "" && <Alert type="error" message={alert} banner={true} />}
    <Input placeholder="Name" onChange={(e) => { setData({ ...data, name: e.target.value }) }} />
    <DatePicker value={data.deadline} onChange={(date) => { setData({ ...data, deadline: date }) }} />
    <Button onClick={() => { create().catch((r) => { setAlert(r) }) }}>Create</Button>

  </div>
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
    {data.alert !== "" && <Alert type="error" message={data.alert} banner={true} />}
    <Button onClick={() => { nav(`/organizations/${organization_id}/create_vote`) }}>Add</Button>
    <Table dataSource={data.list} columns={columns} />
    <Pagination pageSize={data.size} current={data.page} total={data.total} />
  </div>

}




export const Detail = () => {
  const nav = useNavigate();
  const { vote_id } = useParams();


  return <div>
    <Button onClick={() => { nav(-1) }}>Back</Button>
    <CVoteDetail id={vote_id!} />
    <DateRangeUpdate vote_id={vote_id!} />
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
    <DateReport vote_id={vote_id!} />
    {questionReport.map(r => <QuestionReport report={r} />)}
  </div>
}

export const Filling = () => {
  const { vote_id } = useParams();
  const nav = useNavigate();
  const [questionIDs, setQuestionIDs] = useState<number[]>([]);
  const [answers, setAnswers] = useState<number[][]>([]);
  const [currIdx, setCurrIdx] = useState<number|null>(null);
  const setValue = useCallback((vals: number[]) => {
    setAnswers(old => {
		if (!currIdx) {
			return old;
		}
      old[currIdx] = vals;
      return old
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


  const prev = () => {
    setCurrIdx((old) => {
		if (old === null) {
			return old;
		}
      if (old > 0) {
        return old - 1;
      }
      return old;
    });
  }

  const next = () => {
    setCurrIdx((old) => {
		if (old === null) {
			return old;
		}
      if (old < questionIDs.length - 1) {
        return old + 1;
      }
      return old;
    });
  }

  return <>{questionIDs.length > 0  && currIdx !== null
    ? <div>
      <FillingComponent questionID={questionIDs[currIdx]} setValue={setValue} />
      <Button disabled={currIdx === 0} onClick={prev}>Previous</Button><Button disabled={currIdx === questionIDs.length - 1} onClick={next}>Next</Button>
    </div>
    : <div></div>}</>
}