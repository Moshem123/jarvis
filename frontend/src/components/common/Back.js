import React from "react";
import {withRouter} from "react-router-dom";
import styled from 'styled-components';
import PropTypes from "prop-types";

const BackButton = styled.button`
    position: fixed; /* Fixed/sticky position */
    bottom: 20px; /* Place the button at the bottom of the page */
    left: 20px; /* Place the button 30px from the right */
    z-index: 99; /* Make sure it does not overlap */
    background-color: #f8f8f8;
    border: 1px solid #9e9e9e;
`;

const Back = ({history}) => (
    <BackButton className="button" onClick={history.goBack}>
        <i className="fa fa-arrow-left fa-lgx">&nbsp;</i>
    </BackButton>
);

Back.propTypes = {
    history: PropTypes.object.isRequired,
};

export default withRouter(Back);