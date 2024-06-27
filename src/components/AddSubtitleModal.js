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

const AddSubtitleModal = ({
    isOpen,
    onCloseModal,
    onHandleInsert,
    subtitleObject,
    onHandleInputChange,
    onHandleStartInputChange,
    onHandleEndInputChange,
    inputValue,
    endTime,
    startTime,
    data,
    onHandleDisplayListLoader,
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
        try {
            if (!startTime) {
                startTime = subtitleObject.end;
            }
            if (!endTime && data[0].actions[subtitleObject.data.subtitleNumber + 1]) {
                endTime = data[0].actions[subtitleObject.data.subtitleNumber + 1].start;
            } else if(!endTime && !data[0].actions[subtitleObject.data.subtitleNumber + 1]) {
                endTime = subtitleObject.end + 1;
            }
            setErrorMsg("");
            setDisplayError(false);
            onHandleDisplayListLoader(true);
            await onHandleInsert(startTime, endTime, inputValue, subtitleObject);
            onHandleDisplayListLoader(false);
        } catch (error) {
            console.log(error);
            setErrorMsg(error.message);
            setDisplayError(true);
            onHandleDisplayListLoader(false);
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
                            <h2 className={"modal-header-heading"}>Add Subtitle: </h2>
                            <div onClick={() => onCloseModal()}>
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
                                onChange={onHandleInputChange}
                            />
                        </div>
                        <div className={"modal-alignment-container vertical-alignment-container"}>
                            <TextField
                                required
                                id="outlined-required"
                                label="Start Time"
                                defaultValue={subtitleObject ? `${subtitleObject.end}` : ""}
                                size={"small"}
                                onChange={onHandleStartInputChange}
                            />
                        </div>
                        <div className={"modal-alignment-container vertical-alignment-container"}>
                            <TextField
                                required
                                id="outlined-required"
                                label="End Time"
                                defaultValue={data[0].actions[subtitleObject.data.subtitleNumber + 1] ? `${data[0].actions[subtitleObject.data.subtitleNumber + 1].start}` : subtitleObject.end + 1}
                                size={"small"}
                                onChange={onHandleEndInputChange}
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

export default AddSubtitleModal;
