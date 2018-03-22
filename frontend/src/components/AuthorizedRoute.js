import React from 'react'
import { Route, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import PropTypes from "prop-types";

import {checkAuth} from '../actions/loginActions';
import Loader from './common/Loader';

class AuthorizedRoute extends React.Component {

    componentDidMount() {
        this.props.checkAuth();
    }

    render() {
        const { component: Component, loading, logged, ...rest } = this.props;
        return (
            <Route {...rest} render={props => (
                logged
                    ? <div>{loading && <Loader/>} <Component {...props} /></div>
                    : <Redirect to="/auth/login" />
                )} />
        )
    }
}

AuthorizedRoute.propTypes = {
    component: PropTypes.func.isRequired,
    path: PropTypes.string.isRequired,
    loading: PropTypes.bool,
    logged: PropTypes.bool,
};

const mapStateToProps = ({ authenticated, ajaxStatus }) => ({
    loading: ajaxStatus > 0,
    logged: authenticated.authenticated
});

const mapDispatchToProps = (dispatch) => ({
    checkAuth: () => dispatch(checkAuth()),
});

export default connect(mapStateToProps, mapDispatchToProps)(AuthorizedRoute)