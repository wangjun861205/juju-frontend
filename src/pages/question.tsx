import { Input, Button, Alert, Modal, Select, Table, message, Spin } from "antd";
import { useEffect, useState, useReducer, SetStateAction, Dispatch } from "react";
import { useNavigate, useParams } from "react-router";
import { Alert as AlertModel } from "../models/alert";
import { Detail as QuestionDetail, Create as QuestionCreateModel, Question, QuestionType } from "../models/question";
import { Create as OptCreate, Option as OptionModel } from "../models/opt";
import { get, post, put, delete_ } from "../utils/api";
import { List as CQuestionList } from "../components/questions";

import { Create as QuestionCreateComponent, Detail as CQuestionDetail } from "../components/questions";
import { Create as OptionCreateComponent, List as OptionListComponent } from "../components/options";
import { question as fetchQuestion, updateQuestion } from "../apis/question";
import { options_within_question } from "../apis/options";
import { delete_option } from "../apis/options";
import { add_options } from "../apis/options";





export const Detail = () => {
  const { question_id } = useParams();
  const [question, setQuestion] = useState<Question>();
  const navigate = useNavigate();
  useEffect(() => {
    fetch(`/questions/${question_id}`).then(res => {
      if (res.status !== 200) {
        res.text().then(err => {
          message.error(err);
          navigate(-1);
        }).catch(err => {
          message.error(err);
          navigate(-1);
        })
      }
      res.json().then(qst => {
        setQuestion(qst);
      }).catch(err => {
        message.error(err);
      })
    })
  }, [])

  const setOptions: Dispatch<SetStateAction<OptionModel[]>> = (action: SetStateAction<OptionModel[]>) => {
    if (typeof action === "function") {
      setQuestion(old => {
        return { ...old!, options: action(old!.options) }
      })
      return
    }
    setQuestion(old => {
      return { ...old!, options: action }
    });
  }


  return question ? <div><Button onClick={() => { navigate(-1) }}>Back</Button>
    <CQuestionDetail question_id={parseInt(question_id!)} />
    <OptionListComponent options={question!.options} setOptions={setOptions} />
  </div> : <Spin />

}



export const List = () => {
  const { vote_id } = useParams();
  const nav = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  useEffect(() => {
    fetch(`/votes/${vote_id}/questions`).then(res => {
      if (res.status !== 200) {
        res.text().then(err => {
          message.error(err);
          nav(-1);
        }).catch(err => {
          message.error(err);
          nav(-1);
        })
      }
      res.json().then(qs => {
        setQuestions(qs);
      }).catch(err => {
        message.error(err);
      })
    })
  }, [])

  return <CQuestionList questions={questions} setQuestions={setQuestions} />
}