import React from 'react';
import styled from 'styled-components';

import logo from './14623039.png';

const Grid = styled.div`
    height: 100%;
    margin: 0;
    display: flex;
    justify-content: center;
`;
const Container = styled.div`
    align-self: center;
    max-width: 450px;
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
`;
const LoginForm = styled.form`
    display: flex;
    flex-flow: column nowrap;
    background: #fff;
    box-shadow: 0 1px 2px 0 rgba(34, 36, 38, 0.15);
    margin: 1rem 0;
    padding: 1.5em 1.5em;
    border-radius: 5px;
    border: 1px solid rgba(34, 36, 38, 0.15);
    width: 80%;
`;
const ErrorMessage = styled.div`
    box-shadow: 0 0 0 1px #e0b4b4 inset, 0 0 0 0 transparent;
    background-color: #fff6f6;
    color: #9f3a38;
    border-radius: 3.5px;
    padding: 1em 1.5em;
    margin-bottom: 40px;
    width: 80%;
`;
const Image = styled.img`
    width: 60%;
    height: auto;
`;

const Button = styled.button`
    &:after{
      content: "${props => props.disabled ? 'Loading...' : props.content}";
    }
`;

const Input = styled.div`
    position: relative; 
    .input-icon {
        position: absolute;
        left: 10px;
        top: calc(50% - 15px); /* Keep icon in center of input, regardless of the input height */
    }
    input {
        padding-left: 30px;
        width: 100%;
    }
`;

const Login = ({handleSubmit, handleInputChange, loginButtonLoading, errorMessage}) => {
    return (
        <Grid>
            <Container>
                <Image src={logo}/>
                <h5>Login to your tradair account</h5>
                <LoginForm onSubmit={handleSubmit} onChange={handleInputChange}>
                    <Input>
                        <input
                            type="text"
                            name="email"
                            placeholder='E-mail address'/>
                        <label htmlFor="stuff" className="fa fa-user input-icon"/>
                    </Input>

                    <Input>
                        <input
                            name="password"
                            placeholder='Password'
                            type='password'/>
                        <label htmlFor="stuff" className="fa fa-lock input-icon"/>
                    </Input>


                    <Button className="button button-primary" type="submit" disabled={loginButtonLoading} content="Login"/>
                </LoginForm>
                {errorMessage &&
                <ErrorMessage>
                    {errorMessage}
                </ErrorMessage>}
            </Container>
        </Grid>
    );
};

export default Login;