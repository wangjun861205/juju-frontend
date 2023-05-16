import React, { useState, useEffect, Dispatch, SetStateAction, useCallback } from "react";
import { get, put, ListResponse, delete_, DeleteResponse } from "../utils/api";
import { Button, Checkbox, Input, message, Radio, RadioChangeEvent, Row, Select, Table, Modal, TableColumnProps } from "antd";
import { useNavigate } from "react-router";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { QuestionType } from "../models/question";
import { Option } from "../models/opt";
import { Create as AnswerCreate } from "../models/answer";
import { Question } from "../models/question";
import { question as fetch_question} from "../apis/question";
import { options_within_question } from "../apis/options";
import { answers_of_question, submit_answer } from "../apis/answer";
import { Create as QuestionCreateModel } from "../models/question";
import { List as OptionListComponent } from "./options";
import "./questions.css"
import { ColumnType, ExpandableConfig } from "antd/es/table/interface";
import { Upload } from "./upload";
import { Upsert as OptionUpsert, List as OptionList, Create as OptionCreate } from "./options";



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

type QuestionUpdate = {
  description: string,
  type_: "Single" | "Multi",
}

interface UpdateProps {
  question: Question,
  setQuestion: Dispatch<SetStateAction<Question>>,
}

export const Update = ({question, setQuestion}: UpdateProps) => {
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);

  const setDescription = (description: string) => {
    setQuestion(old => {
      return { ...old, description: description }
    })
  }

  const setType_ = (type_: QuestionType) => {
    setQuestion(old => {
      return { ...old, type_: type_ }
    })
  }

  const setOptions: Dispatch<SetStateAction<Option[]>> = (action: SetStateAction<Option[]>) => {
    if (typeof action === "function") {
      setQuestion(old => {
        return { ...old, options: action(old.options) }
      });
      return
    }
    setQuestion(old => {
      return { ...old, options: action }
    })
  }

  const pushOption = (option: Option) => {
    setOptions(old => {
      return [...old, option]
    })
  }


  const typeOptions = [
    { label: "Single", value: QuestionType.SINGLE },
    { label: "Multi", value: QuestionType.MULTI }
  ]
  return <div>
    <Input value={question.description} onChange={(event) =>setDescription(event.target.value)} />
    <Select options={typeOptions} onChange={(event) => { setType_(event.target.value) }} />
    <Button type="primary" onClick={() => {setIsOptionModalOpen(true)}}>Add Option</Button>
    <OptionCreate push={pushOption} isOpen={isOptionModalOpen} setIsOpen={setIsOptionModalOpen} />
    <OptionList options={question.options} setOptions={setOptions}/>
  </div>
}

type QuestionCreate = {
  description: string,
  type_: "Single" | "Multi",
}

interface CreateProps {
  question: QuestionCreateModel | undefined,
  setQuestion: Dispatch<SetStateAction<QuestionCreateModel | undefined>>,
}

export const Create = ({question, setQuestion}: CreateProps) => {
  return <div>
    <Input 
      value={question?.description} 
      placeholder="Description" 
      onChange={
        (event) => { 
          setQuestion(old => { 
            if (!old) return old; 
            return { ...old, description: event.target.value } 
          }) 
        }
      } />
    <Select 
      options={
        [
          { label: "Single", value: QuestionType.SINGLE }, 
          { label: "Multi", value: QuestionType.MULTI }
        ]
      } 
      value={question?.type_} 
      onChange={(value) => { setQuestion(old => { 
        if (!old) return old;
        return { ...old, type_: value}
      }) }} />
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

  type _Question = Question & { options: Option[] } & { answer: number[] };

  const [question, setQuestion] = useState<_Question>();

  const nav = useNavigate();

  const init_question = async () => {
    const q = await fetch_question(question_id);
    const opts = await options_within_question(question_id);
    const ans = await answers_of_question(question_id);
    setQuestion({
      options: opts,
      answer: ans,
      ...q,
    });
  }

  useEffect(() => {
    init_question().then().catch(e => {
      message.error(e);
      nav(-1)
    });
  }, [question_id, nav])

  const radioOnChange = (e: RadioChangeEvent) => {
    setQuestion(q => {
      if (!q) throw new Error("question still be uninitiated");
      if (q.answer.length === 0) {
        q.answer.push(e.target.value);
        return {...q};
      }
      q.answer[0] = e.target.value;
      return {...q};
    })
  }

  const checkboxOnChange = (e: CheckboxChangeEvent) => {
    setQuestion(q => {
      if (!q) throw new Error("question still be uninitiated");
      const answer = [...q.answer];
      if (e.target.checked) {
        answer.push(e.target.value);
        return {...q, answer};
      }
      answer.splice(q.answer.indexOf(e.target.value), 1);
      return {...q, answer};
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
        ? <Radio.Group value={question.answer?.[0]}> 
            {question?.options.map(o => { 
              return <Row><Radio value={o.id} onChange={radioOnChange}>{o.option}</Radio></Row> })
            }
          </Radio.Group>
        : <Checkbox.Group value={question.answer}> 
            {question?.options.map(o => { 
              return <Checkbox value={o.id} onChange={checkboxOnChange}>{o.option}</Checkbox> 
            })}
          </Checkbox.Group>}
      <Button onClick={() => submit_answer(question_id, question.answer).then(_=>message.success('submit answer successfully')).catch(e => message.error(e))}>提交</Button>
    </div>
    : <></>}</>
}


interface UpsertProps  {
  initData?: QuestionCreateModel,
  set?: Dispatch<SetStateAction<QuestionCreateModel>> | ((question: QuestionCreateModel) => void),
  push?: (question: QuestionCreateModel) => void,
  isOpen: boolean,
  setIsOpen: Dispatch<SetStateAction<boolean>>,
  imageSet: string[][],
  setImageSet: Dispatch<SetStateAction<string[][]>>,
}

// export const Upsert = ({initData, set, push, isOpen, setIsOpen, imageSet, setImageSet}: UpsertProps) => {
//   const [question, setQuestion] = useState(initData || {description: "", type_: QuestionType.SINGLE, options: new Array()})
//   const [isOptionOpen, setIsOptionOpen] = useState(false);
//   const [option, setOption] = useState("");

//   useEffect(() => {
//     initData && setQuestion(initData);
//   }, [initData])

//   const columns = [
//     {
//       title: "Option",
//       key: "option",
//       dataIndex: "option"
//     },
//     {
//       title: "Action",
//       render: (i: number) => {
//         return <Row>
//           <Button onClick={() => {setQuestion(prev => {const options = [...prev.options]; options.splice(i); return {...prev, options: options}})}}>Delete</Button>
//           <Button>Edit</Button>
//         </Row>
//       }
//     }
//   ]

//   const addOption = () => {
//     setQuestion(prev => { 
//       const options = [...prev.options]; 
//       options.push({option: option}); 
//       return { ...prev, options: options}}); 
//       setIsOptionOpen(false);
//   }

//   const onOk = () => {
//     if (set) {
//       set(question);
//     } else {
//       push!(question)
//     }
//     setIsOpen(false);
//   }

//   const modalStyle = {
//     paddingLeft: "30px"
//   }

//   const descriptionStyle = {
//     display: "block",
//     marginTop: "30px",
//     marginBottom: "30px",
//   }

//   const typeStyle = {
//     display: "flex",
//     justifyContent: "space-evenly",
//     marginTop: "30px",
//     marginBottom: "30px",
//   }

//   const buttonRowStyle = {
//     marginTop: "30px",
//     marginBottom: "30px",
//     justifyContent: "end",
//   }

//   return <Modal width="600px" open={isOpen} closable={false} onOk={onOk} onCancel={() => {setIsOpen(false)}} destroyOnClose={true}>
//     <Input.TextArea style={descriptionStyle} value={question.description} rows={5} title="Description" onChange={(e) => { setQuestion(prev =>  {return { ...prev, description: e.target.value }} ) }}/>
//     <Radio.Group  value={question.type_} style={typeStyle} onChange={(e) => setQuestion(prev => {return {...prev, type_: e.target.value}})}>
//       <Radio value='SINGLE'>Single</Radio>
//       <Radio value='MULTI'>Multiple</Radio>
//     </Radio.Group>
//     <Row style={buttonRowStyle}>
//       <Button type="primary" onClick={() => {setIsOptionOpen(true)}}>Add a Option</Button>
//     </Row>
//     <OptionUpsert option={}/>
//     <Table dataSource={question.options} columns={columns} />
//   </Modal>
// }

interface ListForCreateProps {
  questions: QuestionCreateModel[],
  setQuestions: (questions: QuestionCreateModel[]) => void,
}

export const ListForCreate = ({questions, setQuestions}: ListForCreateProps) => {
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
          <Button onClick={() => {setIdx(i); setIsOpen(true)}}>Edit</Button>
          <Button danger={true} onClick={() => {questions.splice(i); setQuestions(questions)}}>Delete</Button>
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
    <Table expandable={expandableConfig} dataSource={questions.map((q, i) => ({...q, key: i.toString()}))} columns={columns} pagination={false}/>
  </div>
  
}