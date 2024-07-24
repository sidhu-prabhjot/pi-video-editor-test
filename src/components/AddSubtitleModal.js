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

import '../styles/Main.css';
import '../styles/AddSubtitleModal.css';

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
 * @param {*} isOpen boolean value to indicate if modal is open or closed 
 * @param {object} subtitleObject subtitle data object with all information of the subtitle
 * @param {string} contentInput the string value of the content input field when set
 * @param {string} endTimeInput the string value of the end time input field when set
 * @param {string} startTimeInput the string value of the start time input field when set
 * @param {array} data all subtitles data
 * @param {function} handleCloseModal function to close the modal by setting isOpen to false
 * @param {function} handleInsert function to insert the subtitle into the subtitle data
 * @param {function} handleStartTimeChange function to handle updating the startTimeInput value
 * @param {function} handleEndTimeChange function to handle updating the endTimeInput value
 * @param {function} handleDisplayListLoader function to display the loading spinner
 * @returns 
 */
const AddSubtitleModal = ({
    isOpen,
    subtitleObject,
    contentInput,
    endTimeInput,
    startTimeInput,
    data,
    handleCloseModal,
    handleInsert,
    handleContentInputChange,
    handleStartTimeChange,
    handleEndTimeChange,
    handleDisplayListLoader,
}) => {
    const [responseAlertText, setResponseAlertText] = useState("");
    const [responseAlertSeverity, setResponseAlertSeverity] = useState("warning");
    const [displayResponseAlert, setDisplayResponseAlert] = useState(0);


    const closeModal = () => {
        setDisplayResponseAlert(0);
        handleCloseModal();
    }

    //unique to this component, and will only effect this component's alert
    const showResponseAlert = async (responseText, severity) => {
        setResponseAlertText(responseText);
        setResponseAlertSeverity(severity);
        setDisplayResponseAlert(100);
    }

    //handle confirmation of adding subtitle
    const handleConfirmClick = async () => {
        handleDisplayListLoader(true);
        try {
            if (!startTimeInput) {
                startTimeInput = subtitleObject.end;
            }

            if (!endTimeInput && data[0].actions[subtitleObject.data.subtitleNumber + 1]) {
                //if there exists the next subtitle, then make the new subtitle's end time, the next subtitle's start time
                endTimeInput = data[0].actions[subtitleObject.data.subtitleNumber + 1].start;
            } else if(!endTimeInput && !data[0].actions[subtitleObject.data.subtitleNumber + 1]) {
                //if there does not exist the next subtitle, then make the new subtitle's end time 1 second after the first
                endTimeInput = subtitleObject.end + 1;
            }
            await handleInsert(startTimeInput, endTimeInput, contentInput, subtitleObject);
            closeModal();
        } catch (error) {
            showResponseAlert(error.message, "warning");
            handleDisplayListLoader(false);
        }
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
                    <div className="add-subtitle-container">
                        <div className={"modal-header-container"}>
                            <h2 className={"modal-header-heading"}>Add Subtitle: </h2>
                            <div onClick={() => closeModal()}>
                                <FontAwesomeIcon className="clickable-icon" icon={faCircleXmark} />
                            </div>
                        </div>
                        <div className={"modal-alignment-container vertical-alignment-container"}>
                            <TextField
                                required
                                id="outlined-required"
                                label="New Subtitle Text"
                                defaultValue={""}
                                size={"small"}
                                sx={{width: "100%"}}
                                onBlur={(event) => {handleContentInputChange(event)}}
                            />
                        </div>
                        <div className={"modal-alignment-container vertical-alignment-container"}>
                            <TextField
                                required
                                id="outlined-required"
                                label="Start Time"
                                defaultValue={subtitleObject ? `${subtitleObject.end}` : ""}
                                size={"small"}
                                sx={{width: "100%"}}
                                onBlur={(event) => {handleStartTimeChange(event)}}
                            />
                        </div>
                        <div className={"modal-alignment-container vertical-alignment-container"}>
                            <TextField
                                required
                                id="outlined-required"
                                label="End Time"
                                defaultValue={data[0].actions[subtitleObject.data.subtitleNumber + 1] ? `${data[0].actions[subtitleObject.data.subtitleNumber + 1].start}` : subtitleObject.end + 1}
                                size={"small"}
                                sx={{width: "100%"}}
                                onBlur={(event) => {handleEndTimeChange(event)}}
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

export default AddSubtitleModal;
