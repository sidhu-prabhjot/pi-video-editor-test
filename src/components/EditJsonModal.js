import { useState } from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark } from '@fortawesome/free-regular-svg-icons';

import '../styles/Main.css';
import '../styles/List.css';
import '../styles/EditAllModal.css';

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
    handleCloseModal,
    handleLastUpdatedByChange,
    handleNoteChange,
    handleConfirm,
}) => {
    const [displayError, setDisplayError] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const errorMessage = () => {
        if (displayError) {
            return <p>{errorMsg}</p>
        } else {
            return null;
        }
    }
    
    const handleConfirmClick = async () => {
        if(lastUpdatedByInput !== "") {
            await handleConfirm();
            handleCloseModal();
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
                                defaultValue={lastUpdatedBy}
                                onBlur={(event) => handleLastUpdatedByChange(event)}
                            />
                        </div>
                        <div className={"modal-alignment-container vertical-alignment-container"}>
                            <TextField
                                required
                                id="outlined-required"
                                label="Note"
                                size={"small"}
                                defaultValue={note}
                                onBlur={(event) => handleNoteChange(event)}
                            />
                        </div>
                        {errorMessage()}
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