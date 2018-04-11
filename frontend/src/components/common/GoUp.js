import React from "react";
import styled from 'styled-components';

const UpButton = styled.button`
    position: fixed; /* Fixed/sticky position */
    bottom: 20px; /* Place the button at the bottom of the page */
    right: 20px; /* Place the button 30px from the left */
    z-index: 99; /* Make sure it does not overlap */
    background-color: #f8f8f8;
    border: 1px solid #9e9e9e;
`;

class GoUp extends React.PureComponent {
  state = {
    intervalId: 0
  };

  scrollStep = () => {
    if (window.pageYOffset === 0) {
      clearInterval(this.state.intervalId);
    }
    window.scroll(0, window.pageYOffset - this.props.scrollStepInPx);
  };

  scrollToTop = () => {
    let intervalId = setInterval(this.scrollStep, this.props.delayInMs);
    this.setState({ intervalId: intervalId });
  };

  render() {
    return <UpButton title='Back to top' className='button'
                     onClick={() => { this.scrollToTop(); }}>
      <i className="fa fa-arrow-up fa-lgx"/>
    </UpButton>;
  }
}

GoUp.defaultProps = {
  scrollStepInPx: '50',
  delayInMs: "16.66",
};

export default GoUp;