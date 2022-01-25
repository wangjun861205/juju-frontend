import React from 'react';
import logo from './logo.svg';
import './App.css';
import Index from './pages/index';
import Signup from "./pages/signup";
import Login from "./pages/login";
import { OrganizationList, CreateOrganization, Detail as OrganizationDetail } from "./pages/organization";
import { CreateVote, VoteList, Detail as VoteDetail, Update as VoteUpdate } from './pages/votes';
import { Create as QuestionCreate, Detail as QuestionDetail } from "./pages/question";

import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/organizations">
          <Route path="" element={<OrganizationList />} />
          <Route path="create" element={<CreateOrganization />} />
          <Route path=":organization_id" element={<OrganizationDetail />} />
          <Route path=":organization_id/votes/">
            <Route path="" element={<VoteList />} />
            <Route path="create" element={CreateVote} />
            <Route path=":vote_id/detail" element={<VoteDetail />} />
            <Route path=":vote_id/update" element={<VoteUpdate />} />
            <Route path=":vote_id/questions/">
              <Route path="create" element={<QuestionCreate />} />
              <Route path=":question_id/detail" element={<QuestionDetail />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
