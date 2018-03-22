import React from 'react';

const ToggleButton = ({children,toggleMethod,action, ...rest}) => {
    const handleClick = () => {
        toggleMethod(action);
    };
    return (
        <button {...rest} onClick={handleClick}>
            {children}
        </button>
    );
};

export default ToggleButton;