import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Box = styled.div`
  background: #fff;
  border-radius: 2px;
  box-shadow: 0 0 50px rgba(0, 0, 0, 0.1);
  margin: 30px 5%;
  padding: 5%;
`;
const DirectoryList = styled.ul`
  ul {
      margin-left: 10px;
      padding-left: 20px;
      border-left: 1px dashed #ddd;
  }
  li {
  	  flex: 1;
  	  cursor: pointer;
      list-style: none;
      font-size: 17px;
      font-style: italic;
      font-weight: normal;
      &:before {
          margin-right: 10px;
          content: "";
          height: 20px;
          vertical-align: middle;
          width: 20px;
          background-repeat: no-repeat;
          display: inline-block;
          /* file icon by default */
          background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBmaWxsPSJsaWdodGdyZXkiIGQ9Ik04NS43MTQsNDIuODU3Vjg3LjVjMCwxLjQ4Ny0wLjUyMSwyLjc1Mi0xLjU2MiwzLjc5NGMtMS4wNDIsMS4wNDEtMi4zMDgsMS41NjItMy43OTUsMS41NjJIMTkuNjQzIGMtMS40ODgsMC0yLjc1My0wLjUyMS0zLjc5NC0xLjU2MmMtMS4wNDItMS4wNDItMS41NjItMi4zMDctMS41NjItMy43OTR2LTc1YzAtMS40ODcsMC41MjEtMi43NTIsMS41NjItMy43OTQgYzEuMDQxLTEuMDQxLDIuMzA2LTEuNTYyLDMuNzk0LTEuNTYySDUwVjM3LjVjMCwxLjQ4OCwwLjUyMSwyLjc1MywxLjU2MiwzLjc5NXMyLjMwNywxLjU2MiwzLjc5NSwxLjU2Mkg4NS43MTR6IE04NS41NDYsMzUuNzE0IEg1Ny4xNDNWNy4zMTFjMy4wNSwwLjU1OCw1LjUwNSwxLjc2Nyw3LjM2NiwzLjYyN2wxNy40MSwxNy40MTFDODMuNzgsMzAuMjA5LDg0Ljk4OSwzMi42NjUsODUuNTQ2LDM1LjcxNHoiLz48L3N2Zz4=);
          background-position: center 2px;
          background-size: 60% auto;
    }
    &.folder {
	    &:before {
	      /* folder icon if folder class is specified */
	      background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBmaWxsPSJsaWdodGJsdWUiIGQ9Ik05Ni40MjksMzcuNXYzOS4yODZjMCwzLjQyMy0xLjIyOCw2LjM2MS0zLjY4NCw4LjgxN2MtMi40NTUsMi40NTUtNS4zOTUsMy42ODMtOC44MTYsMy42ODNIMTYuMDcxIGMtMy40MjMsMC02LjM2Mi0xLjIyOC04LjgxNy0zLjY4M2MtMi40NTYtMi40NTYtMy42ODMtNS4zOTUtMy42ODMtOC44MTdWMjMuMjE0YzAtMy40MjIsMS4yMjgtNi4zNjIsMy42ODMtOC44MTcgYzIuNDU1LTIuNDU2LDUuMzk0LTMuNjgzLDguODE3LTMuNjgzaDE3Ljg1N2MzLjQyMiwwLDYuMzYyLDEuMjI4LDguODE3LDMuNjgzYzIuNDU1LDIuNDU1LDMuNjgzLDUuMzk1LDMuNjgzLDguODE3VjI1aDM3LjUgYzMuNDIyLDAsNi4zNjEsMS4yMjgsOC44MTYsMy42ODNDOTUuMjAxLDMxLjEzOCw5Ni40MjksMzQuMDc4LDk2LjQyOSwzNy41eiIvPjwvc3ZnPg==);
	      background-position: center top;
	      background-size: 75% auto;
	    }
    }
  }
  a {
      border-bottom: 1px solid transparent;
      color: #888;
      text-decoration: none;
      transition: all 0.2s ease;
      &:hover {
          border-color: #eee;
          color: #000;
      }
  }
  .folder{
    &, & > a {
      color: #777;
      font-weight: bold;
    }
  }
`;
const InputFlex = styled.form`
  display: flex;
`;
const Input = styled.input`
  width: 100%;
  margin-bottom: 0;
`;
const CleanA = styled.button`
	-webkit-appearance: initial;
	background: none;
	border: none;
	margin: 0;
	padding: 0;
	color: rgb(72, 137, 159);
	cursor: pointer;
	&:active{
	    outline: none;
	}
`;
const MyI = styled.i`
	padding-left: 9px;
`;
/*const ErrorMessage = styled.div`
    box-shadow: 0 0 0 1px #e0b4b4 inset, 0 0 0 0 transparent;
    background-color: #fff6f6;
    color: #9f3a38;
    border-radius: 3.5px;
    padding: 1em 1.5em;
    margin-bottom: 20px;
    width: 80%;
    visibility: ${props => props.show ? 'auto' : 'hidden'};

    
`;*/

const errorMessageStyle = {
	boxShadow: '0 0 0 1px #e0b4b4 inset, 0 0 0 0 transparent',
	backgroundColor: '#fff6f6',
	color: '#9f3a38',
	borderRadius: '3.5px',
	padding: '1em 1.5em',
	marginBottom: '20px',
	width: '80%',
};

const InstanceLogsUI = ({structure, directory, changeDirectory, changeDirectorySubmit, errorMessage, dirClick, fileClick}) => {
	return (
		<Box>
			{errorMessage &&
				<div style={errorMessageStyle}>{errorMessage}</div>
			}
			<InputFlex onSubmit={changeDirectorySubmit}>
				<Input type="text" value={directory} onChange={changeDirectory}/>
				<CleanA type="submit">
					<MyI className="fa fa-arrow-circle-right fa-2x">&nbsp;</MyI>
				</CleanA>
			</InputFlex>
			<DirectoryList>
				{structure.directories.map(dir => <li className="folder" key={dir} onClick={dirClick}>{dir}</li>)}
				{structure.files.map(dir =>
					<div style={{display: 'flex'}} key={dir.fileName}>
						<li onClick={fileClick}>{dir.fileName}</li>{" "}
						<span style={{color: "#888"}}>({dir.modifyDate}, {dir.size})</span>
					</div>)}
			</DirectoryList>
		</Box>
	);
};

InstanceLogsUI.propTypes = {
	structure: PropTypes.object.isRequired,
	directory: PropTypes.string,
	changeDirectory: PropTypes.func.isRequired,
	changeDirectorySubmit: PropTypes.func.isRequired,
	errorMessage: PropTypes.string,
	dirClick: PropTypes.func.isRequired,
	fileClick: PropTypes.func.isRequired,
};

InstanceLogsUI.defaultProps = {
	directory: '/tradair/logs/tnet'
};

export default InstanceLogsUI;