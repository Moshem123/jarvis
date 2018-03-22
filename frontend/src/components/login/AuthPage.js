import React, {PureComponent} from 'react';
import {connect} from "react-redux";

import Login from './Login';
import * as loginActions from "../../actions/loginActions";

// Helper functions
function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
function mergeDeep(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, {[key]: {}});
                mergeDeep(target[key], source[key]);
            } else {
                Object.assign(target, {[key]: source[key]});
            }
        }
    }

    return mergeDeep(target, ...sources);
}

class AuthPage extends PureComponent {
    state = {
        form: {},
        loginButtonLoading: false,
        errorMsg: ''
    };

    handleInputChange = (event) => {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState(prevState => (
            mergeDeep({}, prevState, {form: {[name]: value}})
        ));
    };

    handleSubmit = (e) => {
        e.preventDefault();
        this.setState({loginButtonLoading: true});
        this.props.signinUser(this.state.form)
            .then(() => this.props.history.push('/app'))
            .catch((err) => {
                this.setState({loginButtonLoading: false, errorMsg: err})
            });
    };

    render() {

        const {loginButtonLoading, errorMsg} = this.state;
        return (
            <Login
                handleSubmit={this.handleSubmit}
                handleInputChange={this.handleInputChange}
                loginButtonLoading={loginButtonLoading}
                errorMessage={errorMsg}
            />
        );
    }

}

function mapStateToProps(state) {
    return {
        authenticated: state.authenticated,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        signinUser: (data) => dispatch(loginActions.signinUser(data))
    }
}


export default connect(mapStateToProps, mapDispatchToProps)(AuthPage);
