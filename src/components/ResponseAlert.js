import Alert from '@mui/material/Alert';

const ResponseAlert = ({responseText, severity}) => {

    return (
        <div style={{margin: "4px 8px 0px 0px"}}>
            <Alert severity={severity}>
                {responseText}
            </Alert>
        </div>
    );

}

export default ResponseAlert;