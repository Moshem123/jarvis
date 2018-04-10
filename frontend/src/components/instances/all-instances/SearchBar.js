import React from 'react';
import Select from 'react-select';
import styled from 'styled-components';

const Container = styled.div`
  margin: 30px 30px 10px;
`;

const SearchBar = ({ tags, handleTagChange, currentTagValue }) => {
  return (
    <Container>
      <Select.Creatable
        multi
        placeholder="Search..."
        options={tags}
        onChange={handleTagChange}
        value={currentTagValue}/>
    </Container>
  );
};

export default SearchBar;
