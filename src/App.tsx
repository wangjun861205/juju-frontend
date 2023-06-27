import React from 'react';
import './App.css';
import Signup from "./pages/signup";
import Login from "./pages/login";
import { List as OrganizationList, Create as CreateOrganization, Detail as OrganizationDetail, Update as UpdateOrganization, AddUsers, SearchWithContext as SearchOrganization } from "./pages/organization";
import { CreateVote, VoteList, Detail as VoteDetail, Update as VoteUpdate, Filling as VoteFilling } from './pages/votes';
import { Detail as QuestionDetail, List as QuestionList } from "./pages/question";
import { List as AnswerList } from "./pages/answer";
import { Report } from "./pages/votes";
import { Find as FindUser, List as UserList } from "./pages/user";
import { PaginationWrapper } from './wrapper/pagination';
import Profile from "./pages/profile";
import {QueryClientProvider, QueryClient} from 'react-query';


import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

function App() {
  const queryClient = new QueryClient();
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/organizations" replace />} />
        <Route path="/profile" element={<QueryClientProvider client={queryClient}><Profile /></QueryClientProvider>} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/organizations">
          <Route path="" element={<OrganizationList />} />
          <Route path="create" element={<CreateOrganization />} />
          <Route path="search" element={<SearchOrganization />} />
          <Route path=":organization_id">
            <Route path="" element={<OrganizationDetail />} />
            <Route path="update" element={<UpdateOrganization />} />
            <Route path="users">
              <Route path="add" element={<AddUsers />} />
            </Route>
            <Route path="votes">
              <Route path="" element={<VoteList />} />
              <Route path="create" element={<CreateVote />} />
            </Route>
          </Route>
        </Route>
        <Route path="/votes">
          <Route path=":vote_id" >
            <Route path="detail" element={<VoteDetail />} />
            <Route path="update" element={<VoteUpdate />} />
            <Route path="filling" element={<VoteFilling />} />
            <Route path="questions">
              <Route path="" element={<QuestionList />} />
            </Route>
            {/* <Route path="date_ranges" >
              <Route path="" element={<DateUpdate />} />
              <Route path="report" element={<DateReport />} />
            </Route> */}
            <Route path="report" element={<Report />} />
          </Route>
        </Route>
        <Route path="/questions">
          <Route path=":question_id">
            <Route path="" element={<QuestionDetail />} />
            <Route path="answers" element={<AnswerList />} />
          </Route>
        </Route>
        <Route path="/users" >
          <Route path="" element={<UserList />} />
          {/* <Route path="" element={<FindUser />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
