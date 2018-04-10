import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Container = styled.div`
  margin-right: 30px;
  display: flex;
  flex-direction: row-reverse;
  align-items: stretch;
  //justify-content: flex-end;
`;

const Select = styled.select`
  margin-bottom: 0;
  margin-left: 5px;
  height: 30px;
  padding: 0 0 0 5px;
`;

const Button = styled.button`
  background-color: #f8f8f8;
  border: 1px solid #9e9e9e;
  margin-bottom: 0;
  margin-left: 5px;
  cursor: pointer;
  i {
    color: ${props => props.isSelected && '#26d6ff' };
  }
`;

const DisplayOptions = ({ currentlySelectedNumberOfDisplayedItems, availableNumberOfDisplayedItems, changeNumOfItems, currentlySelectedListType, changeListType }) => {
  return (
    <Container>
      <div>
        <Select value={currentlySelectedNumberOfDisplayedItems} onChange={changeNumOfItems}>
          {availableNumberOfDisplayedItems.map(e => <option key={e} value={e}>{e}</option>)}
        </Select>
      </div>
      <Button onClick={changeListType} value="boxes" isSelected={currentlySelectedListType === 'boxes'}><i className="fa fa-th" /></Button>
      <Button onClick={changeListType} value="table" isSelected={currentlySelectedListType === 'table'}><i className="fa fa-list-ul"/></Button>
    </Container>
  );
};

DisplayOptions.propTypes = {
  currentlySelectedNumberOfDisplayedItems: PropTypes.number.isRequired,
  availableNumberOfDisplayedItems: PropTypes.array.isRequired,
  changeNumOfItems: PropTypes.func.isRequired,
  changeListType: PropTypes.func.isRequired,
  currentlySelectedListType: PropTypes.string.isRequired,
};

export default DisplayOptions;