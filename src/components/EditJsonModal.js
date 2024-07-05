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

const EditJsonModal = ({
    isOpen,
    onCloseModal,
    lastUpdatedBy,
    note,
    onHandleLastUpdatedByChange,
    onHandleNoteChange,
    onHandleConfirm,
    editedByValue,
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

    const sleep = async (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const handleConfirmClick = async () => {
        if(editedByValue !== "") {
            await onHandleConfirm();
            onCloseModal();
        }
    }

    return (
        <div>
            <Modal
                open={isOpen}
                onClose={onCloseModal}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <div className="edit-selected-container">
                        <div className={"modal-header-container"}>
                            <h2 className={"modal-header-heading"}>Update JSON Metadata: </h2>
                            <div onClick={() => onCloseModal()}>
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
                                onBlur={(e) => onHandleLastUpdatedByChange(e)}
                            />
                        </div>
                        <div className={"modal-alignment-container vertical-alignment-container"}>
                            <TextField
                                required
                                id="outlined-required"
                                label="Note"
                                size={"small"}
                                defaultValue={note}
                                onBlur={(e) => onHandleNoteChange(e)}
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