import {useState} from 'react';

import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

import '../styles/TextSubmit.css';

const TextSubmit = ({
    handleSubmit,
    handleInputChange,
    submitButtonText,
    label,
    displaySubmitButton,
    value,
    id
}) => {

    return (
        <div className={"text-submit-container"}>
            <TextField
            sx={{width: 180}}
            className={"submit-input"}
            required
            id={id}
            label={label}
            size={"small"}
            value={value}
            onChange={handleInputChange}
            />
            <div style={{display: displaySubmitButton ? "flex" : "none"}} className={"submit-button-container"}>
                <Button className={"button insert-button"} size={"medium"} variant={"outlined"} onClick={handleSubmit}>{submitButtonText}</Button>
            </div>
        </div>
    )
}

export default TextSubmit;