import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import '../styles/TextSubmit.css';

const TextSubmit = ({handleSubmit, handleInputChange, submitButtonText,label}) => {
    return (
        <div className={"text-submit-container"}>
            <TextField
            className={"submit-input"}
            required
            id="outlined-required"
            label={label}
            size={"small"}
            onChange={handleInputChange}
            />
            <div className={"submit-button-container"}>
                <Button className={"button insert-button"} size={"medium"} variant={"outlined"} onClick={handleSubmit}>{submitButtonText}</Button>
            </div>
        </div>
    )
}

export default TextSubmit;