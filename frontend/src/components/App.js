import React from 'react';
import {Switch, Route, Redirect} from 'react-router-dom';
import DocumentTitle from 'react-document-title';

import PrimaryLayout from './PrimaryLayout';
import AuthPage from './login/AuthPage';
import AuthorizedRoute from './AuthorizedRoute';

const App = () => (
    <DocumentTitle title="Jarvis">
        <Switch>
            <Route path="/auth" component={AuthPage}/>
            <AuthorizedRoute path="/app" component={PrimaryLayout}/>
            <Redirect to="/app" />
        </Switch>
    </DocumentTitle>
);

export default App;
