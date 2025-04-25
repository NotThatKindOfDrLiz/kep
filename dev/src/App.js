import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import HomePage from './components/HomePage';
import SubmitForm from './components/SubmitForm';
import WeeklyThread from './components/WeeklyThread';
import AdminDashboard from './components/AdminDashboard';

function App() {
  return (
    <Router>
      <Switch>
        <Route path='/' exact>
          <HomePage />
          <SubmitForm />
          <WeeklyThread items={[]} />
        </Route>
        <Route path='/admin'>
          <AdminDashboard />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;