import TextField from '@mui/material/TextField';
import '../styles/TextSubmit.css';

const TextSubmit = ({handleInputChange,label}) => {
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
        </div>
    )
}

export default TextSubmit;