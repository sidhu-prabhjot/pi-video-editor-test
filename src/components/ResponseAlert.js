import Alert from '@mui/material/Alert';

const ResponseAlert = ({responseText, severity}) => {

    return (
        <Alert severity={severity}>
            {responseText}
        </Alert>
    );

}

export default ResponseAlert;