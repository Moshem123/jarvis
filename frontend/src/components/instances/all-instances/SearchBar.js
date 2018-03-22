import React from 'react';
import Select from 'react-select';

const SearchBar = ({tags, handleTagChange, currentTagValue}) => {
    return (
        <div style={{margin: '30px'}}>
            <Select.Creatable
                multi
                placeholder="Search..."
                options={tags}
                onChange={handleTagChange}
                value={currentTagValue}/>
        </div>
    );
};

export default SearchBar;
