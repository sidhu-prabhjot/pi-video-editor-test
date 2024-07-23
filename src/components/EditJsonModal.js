import { useState } from 'react';

//custom components
import ResponseAlert from './ResponseAlert';

//material ui
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

//fontawesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark } from '@fortawesome/free-regular-svg-icons';

import '../styles/EditJsonModal.css';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

/**
 * 
 * @param {*} isOpen boolean that will indicate if the modal is open or closed
 * @param {*} lastUpdateBy string value of the lastUpdatedBy field extracted from JSON metadata
 * @param {*} lastUpdateByInput string value of the last updated by input after it has been set
 * @param {*} note string value of the note field extracted from JSON metadata
 * @param {function} handleCloseModal function that will close the modal
 * @param {function} handleLastUpdatedByChange function that will update the lastUpdateByInput value
 * @param {function} handleNoteChange function that will update the note input
 * @param {function} handleConfirm function that will submit the data and call for JSON export with udpated data
 * @returns 
 */
const EditJsonModal = ({
    isOpen,
    lastUpdatedBy,
    lastUpdatedByInput,
    note,
    noteInput,
    handleCloseModal,
    handleLastUpdatedByChange,
    handleNoteChange,
    handleConfirm,
}) => {
    const [responseAlertText, setResponseAlertText] = useState("");
    const [responseAlertSeverity, setResponseAlertSeverity] = useState("success");
    const [displayResponseAlert, setDisplayResponseAlert] = useState(0);

    //makes sure that the error message is hidden before closing the modal
    const closeModal = () => {
        setDisplayResponseAlert(0);
        handleCloseModal();
    }
    
    const handleConfirmClick = async () => {

        try {
            await handleConfirm(lastUpdatedByInput);
            closeModal();
        } catch (error) {
            showResponseAlert(error.message, "warning");
        }
 
    }

    //unique to this component, and will only effect this component's alert
    const showResponseAlert = async (responseText, severity) => {
        setResponseAlertText(responseText);
        setResponseAlertSeverity(severity);
        setDisplayResponseAlert(100);
    }

    return (
        <div>
            <Modal
                open={isOpen}
                onClose={handleCloseModal}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <div className="edit-selected-container">
                        <div className={"modal-header-container"}>
                            <h2 className={"modal-header-heading"}>Update JSON Metadata: </h2>
                            <div onClick={() => handleCloseModal()}>
                                <FontAwesomeIcon className="clickable-icon" icon={faCircleXmark} />
                            </div>
                        </div>
                        <div className={"modal-alignment-container vertical-alignment-container"}>
                            <TextField
                                required
                                id="outlined-required"
                                label="Last Updated By"
                                size={"small"}
                                defaultValue={`${lastUpdatedBy}`}
                                sx={{width: "100%"}}
                                onBlur={(event) => handleLastUpdatedByChange(event)}
                            />
                        </div>
                        <div className={"modal-alignment-container vertical-alignment-container"}>
                            <TextField
                                required
                                id="outlined-required"
                                label="Note"
                                size={"small"}
                                defaultValue={`${note}`}
                                sx={{width: "100%"}}
                                onBlur={(event) => handleNoteChange(event)}
                            />
                        </div>
                        <div className={"response-alert-container"} style={{opacity: displayResponseAlert, display: displayResponseAlert === 0 ? "none" : "flex"}}>
                            <ResponseAlert responseText={responseAlertText} severity={responseAlertSeverity}/>
                        </div>
                        <Button size={"medium"} variant={"contained"} onClick={handleConfirmClick}>
                            Confirm
                        </Button>
                    </div>
                </Box>
            </Modal>
        </div>
    );
}

export default EditJsonModal;