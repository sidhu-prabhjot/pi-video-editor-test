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
    endTime,
    subtitle,
    onHandleInputChange,
    inputValue
}) => {

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
                        <h2 ref={(_subtitle) => (subtitle = _subtitle)} className={"modal-header-heading"}>Add Subtitle: </h2>
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
                        onBlur={() => {}}
                        />
                    </div>
                    <Button size={"medium"} variant={"contained"} onClick={() => {onHandleInsert(endTime, inputValue)}}>Confirm</Button>
                </div>
            </Box>
        </Modal>
    </div>
    );

}

export default AddSubtitleModal;