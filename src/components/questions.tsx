import React, { useState, useEffect, Dispatch, SetStateAction, useCallback } from "react";
import { get, put, ListResponse, delete_, DeleteResponse } from "../utils/api";
import { Button, Checkbox, Input, message, Radio, RadioChangeEvent, Row, Select, Table, Modal, TableColumnProps, TableProps, Descriptions, Spin, Image } from "antd";
import { useNavigate } from "react-router";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { QuestionType } from "../models/question";
import { Option } from "../models/opt";
import { Create as AnswerCreate } from "../models/answer";
import { Question, Detail as QuestionDetail } from "../models/question";
import { question as fetch_question } from "../apis/question";
import { options_within_question } from "../apis/options";
import { answers_of_question, submit_answer } from "../apis/answer";
import { Create as QuestionCreateModel } from "../models/question";
import { List as OptionListComponent } from "./options";
import "./questions.css"
import { ColumnType, ExpandableConfig } from "antd/es/table/interface";
import { Upload } from "./upload";
import { Update as OptionUpdate, List as OptionList, Create as OptionCreate } from "./options";



type Item = {
  id: number,
  description: string,
  has_answered: boolean,
}

interface ListProps {
  questions: Question[],
  setQuestions: Dispatch<SetStateAction<Question[]>>,
}

export const List = ({ questions, setQuestions }: ListProps) => {
  const nav = useNavigate();

  const remove = (id: number) => {
    fetch(`/questions/${id}`, { method: "DELETE" })
    .then(resp => {
      if (resp.status !== 200) {
        message.error('Failed to delete question');
        return;
      }
      message.success('Question deleted')
      setQuestions(prev => prev.filter(q => q.id !== id))
    })
    .catch(err => message.error(err))
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
      title: "Has Updated",
      dataIndex: "has_updated",
      key: "has_updated",
    },
    {
      title: "Actions",
      render: (_: any, record: Item, i: number) => {
        return <div>
          <Button onClick={(event) => { event.stopPropagation(); nav(`/questions/${record.id}/update`); }}>Update</Button>
          <Button onClick={(event) => { event.stopPropagation(); remove(record.id)}} danger={true}>Delete</Button>
        </div>
      }
    }
  ]

  const expandableConfig: ExpandableConfig<Question> = {
    expandedRowRender: (record) => {
      return record.options.map(o => {
          return <Descriptions key={o.id} title="Options" column={3}>
            <Descriptions.Item label="ID">{o.id}</Descriptions.Item>
            <Descriptions.Item label="Option">{o.option}</Descriptions.Item>
            <Descriptions.Item label="Images">{o.images?.map(img => { 
              return <Image key={img} src={img} />
            })}</Descriptions.Item>
          </Descriptions>
        })
    }
  }

  return <Table rowKey="id" columns={columns} dataSource={questions} onRow={(item: Question) => {
    return {
      onClick: () => {
        nav(`/questions/${item.id}`);
      }
    }
  }} expandable={expandableConfig}/>
}


export const Detail = ({ question_id }: { question_id: number }) => {
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



interface FillingProps {
  question: Question,
  setAnswer: (answer: number[]) => void,
}


export const Filling = ({ question, setAnswer }: FillingProps) => {

  return <>
      <Descriptions>
        <Descriptions.Item label="ID">{question.id}</Descriptions.Item>
        <Descriptions.Item label="Description">{question.description}</Descriptions.Item>
        <Descriptions.Item label="Version">{question.version}</Descriptions.Item>       
      </Descriptions>
      {question.type_ === QuestionType.SINGLE
        ? <Radio.Group value={question.answer ? question.answer[0] : null}>
          {question?.options.map(o => {
            return <Row className='flex-row justify-start items-center'>
              <Radio value={o.id} onChange={e => setAnswer([e.target.value])}>{o.option}</Radio>
              { o.images.map(img => <Image className='max-w-[100px]' key={img} src={img} />)}
              </Row>
          })
          }
        </Radio.Group>
        : <Checkbox.Group value={question.answer}>
          {question?.options.map(o => 
            <Row className='flex-row justify-start items-center'>
              <Checkbox value={o.id} onChange={e => {e.target.checked ? setAnswer([e.target.value, ...question.answer]) : setAnswer(question.answer.filter(a => a !== e.target.value))}}>{o.option}</Checkbox>)
              { o.images.map(img => <Image className='max-w-[100px]' key={img} src={img} />)}
            </Row>
          )}
        </Checkbox.Group>}
    </>
}


interface UpsertProps {
  question: Question,
  setQuestion: Dispatch<SetStateAction<Question>>,
  isOpen: boolean,
  setIsOpen: Dispatch<SetStateAction<boolean>>,
}


export const Update = ({ question, setQuestion, isOpen, setIsOpen }: UpsertProps) => {
  const [opens, setOpens] = useState<boolean[]>(new Array(question.options.length).fill(false));

  const columns = [
    {
      title: "Option",
      key: "option",
      dataIndex: "option"
    },
    {
      title: "Action",
      render: (i: number) => {
        return <Row>
          <Button onClick={() => { setQuestion(prev => { const options = [...prev.options]; options.splice(i); return { ...prev, options: options } }) }}>Delete</Button>
          <Button>Edit</Button>
        </Row>
      }
    }
  ]


  const modalStyle = {
    paddingLeft: "30px"
  }

  const descriptionStyle = {
    display: "block",
    marginTop: "30px",
    marginBottom: "30px",
  }

  const typeStyle = {
    display: "flex",
    justifyContent: "space-evenly",
    marginTop: "30px",
    marginBottom: "30px",
  }

  const buttonRowStyle = {
    marginTop: "30px",
    marginBottom: "30px",
    justifyContent: "end",
  }

  return <Modal width="600px" open={isOpen} closable={false} onCancel={() => { setIsOpen(false) }} destroyOnClose={true}>
    <Input.TextArea style={descriptionStyle} value={question.description} rows={5} title="Description" onChange={(e) => { setQuestion(prev => { return { ...prev, description: e.target.value } }) }} />
    <Radio.Group value={question.type_} style={typeStyle} onChange={(e) => setQuestion(prev => { return { ...prev, type_: e.target.value } })}>
      <Radio value='SINGLE'>Single</Radio>
      <Radio value='MULTI'>Multiple</Radio>
    </Radio.Group>
    <Row style={buttonRowStyle}>
      <Button type="primary" onClick={() => { }}>Add a Option</Button>
    </Row>
    {question.options.map((o, i) => {
      return <OptionUpdate
        option={o}
        key={i}
        setOption={
          (action: SetStateAction<Option>) => {
            setQuestion((prev) => {
              if (typeof action === "function") {
                const options = [...prev.options];
                options[i] = action(options[i]);
                return { ...prev, options };
              }
              return { ...prev, options: { ...prev.options, [i]: action } }
            })
          }}
        isOpen={opens[i]}
        setIsOpen={(action: SetStateAction<boolean>) => {
          if (typeof action === 'function') {
            setOpens(prev => {
              const next_opens = [...opens];
              next_opens[i] = action(next_opens[i]);
              return next_opens;
            })
            return
          }
          setOpens(prev => {
            const next_opens = [...opens];
            next_opens[i] = action;
            return next_opens;
          })
        }} />
    })
    }
    <Table dataSource={question.options} columns={columns} />
  </Modal>
}

interface ListForCreateProps {
  questions: QuestionCreateModel[],
  setQuestions: (questions: QuestionCreateModel[]) => void,
}

export const ListForCreate = ({ questions, setQuestions }: ListForCreateProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [idx, setIdx] = useState<number>();
  const [editing, setEditing] = useState<QuestionCreateModel>();

  useEffect(() => {
    if (idx !== undefined) {
      setEditing(questions[idx]);
    }
  }, [idx])

  const set = useCallback((question: QuestionCreateModel) => {
    if (idx !== undefined) {
      questions[idx] = question;
      setQuestions(questions);
      setIdx(undefined);
    }
  }, [idx])

  const columns: ColumnType<QuestionCreateModel>[] = [
    {
      title: "Description",
      key: "description",
      dataIndex: "description",
    },
    {
      title: "Type",
      key: "type_",
      dataIndex: "type_",
    },
    {
      title: "Action",
      render: (_, item, i) => {
        return <Row>
          <Button onClick={() => { setIdx(i); setIsOpen(true) }}>Edit</Button>
          <Button danger={true} onClick={() => { questions.splice(i); setQuestions(questions) }}>Delete</Button>
        </Row>
      }
    }
  ]

  const expandableConfig: ExpandableConfig<QuestionCreateModel> = {
    expandedRowRender: (record) => {
      const columns = [
        {
          title: "Option",
          key: "option",
          dataIndex: "option",
        }
      ]
      return <Table pagination={false} dataSource={record.options} columns={columns} />
    },
  }

  return <div>
    <Table expandable={expandableConfig} dataSource={questions.map((q, i) => ({ ...q, key: i.toString() }))} columns={columns} pagination={false} />
  </div>

}

interface CreateProps {
  isOpen: boolean,
  setIsOpen: Dispatch<SetStateAction<boolean>>,
  onOk: (question: Question) => void,
}

export const Create = ({ isOpen, setIsOpen, onOk }: CreateProps) => {
  const [question, setQuestion] = useState<Question>({ id: 0, description: "", type_: QuestionType.SINGLE, options: [], version: 0, has_answered: false, answer: [] })
  const [optionOpens, setOptionOpens] = useState<boolean[]>(new Array(question.options.length).fill(false));
  const [createOptionOpen, setCreateOptionOpen] = useState(false);

  const setOptions = (action: SetStateAction<Option[]>) => {
    if (typeof action === "function") {
      setQuestion((prev) => {
        return { ...prev, options: action(prev.options) }
      })
      return
    }
    setQuestion((prev) => {
      return { ...prev, options: action }
    })
  }



  const modalStyle = {
    paddingLeft: "30px"
  }

  const descriptionStyle = {
    display: "block",
    marginTop: "30px",
    marginBottom: "30px",
  }

  const typeStyle = {
    display: "flex",
    justifyContent: "space-evenly",
    marginTop: "30px",
    marginBottom: "30px",
  }

  const buttonRowStyle = {
    marginTop: "30px",
    marginBottom: "30px",
    justifyContent: "end",
  }

  return <Modal width="600px" open={isOpen} closable={true} onOk={() => {onOk(question); setIsOpen(false)}} onCancel={() => { setIsOpen(false) }} destroyOnClose={true}>
    <Input.TextArea style={descriptionStyle} value={question.description} rows={5} title="Description" onChange={(e) => { setQuestion(prev => { return { ...prev, description: e.target.value } }) }} />
    <Radio.Group value={question.type_} style={typeStyle} onChange={(e) => setQuestion(prev => { return { ...prev, type_: e.target.value } })}>
      <Radio value='SINGLE'>Single</Radio>
      <Radio value='MULTI'>Multiple</Radio>
    </Radio.Group>
    <Row style={buttonRowStyle}>
      <Button type="primary" onClick={() => { setCreateOptionOpen(true) }}>Add a Option</Button>
    </Row>
    {question.options.map((o, i) => {
      return <OptionUpdate
        option={o}
        key={i}
        setOption={
          (action: SetStateAction<Option>) => {
            setQuestion((prev) => {
              if (typeof action === "function") {
                const options = [...prev.options];
                options[i] = action(options[i]);
                return { ...prev, options };
              }
              return { ...prev, options: { ...prev.options, [i]: action } }
            })
          }}
        isOpen={optionOpens[i]}
        setIsOpen={(action: SetStateAction<boolean>) => {
          if (typeof action === 'function') {
            setOptionOpens(prev => {
              const next_opens = [...optionOpens];
              next_opens[i] = action(next_opens[i]);
              return next_opens;
            })
            return
          }
          setOptionOpens(prev => {
            const next_opens = [...optionOpens];
            next_opens[i] = action;
            return next_opens;
          })
        }} />
    })
    }
    <OptionCreate isOpen={createOptionOpen} setIsOpen={setCreateOptionOpen} onOk={(option) => {
      setQuestion(prev => {
      return {...prev, options: [...prev.options, option]}
      })}}/>
    <OptionList options={question.options} setOptions={setOptions}/>
  </Modal>
}