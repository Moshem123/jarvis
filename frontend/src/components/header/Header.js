import React from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import PropTypes from "prop-types";

import NavBar from './NavBar';
import {logOut} from "../../actions/loginActions";

const Header = (props) => {
    const handleLogOut = () => {
        props.logOut();
        props.history.push('/')
    };
    return (
        <div>
            <NavBar name={props.name} handleLogOut={handleLogOut}/>
        </div>
    );
};

Header.propTypes = {
    logOut: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({name: `${state.authenticated.data.fName} ${state.authenticated.data.lName}`});

const mapDispatchToProps = (dispatch) => ({logOut: () => dispatch(logOut())});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Header));