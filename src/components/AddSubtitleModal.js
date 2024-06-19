import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';

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

const AddSubtitleModal = ({isOpen, onCloseModal, onHandleInsert, endTime, subtitle, onHandleInputChange, inputValue}) => {

    return (
    <div>
        <Modal
            open={isOpen}
            onClose={onCloseModal}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <div>
                    <h2 ref={(_subtitle) => (subtitle = _subtitle)}>Hello</h2>
                    <button onClick={onCloseModal}>close</button>
                    <form>
                        <input type="text" value={inputValue} onChange={onHandleInputChange} />
                        <button onClick={() => onHandleInsert(endTime, inputValue)}>add</button>
                    </form>
                </div>
            </Box>
        </Modal>
    </div>
    );

}

export default AddSubtitleModal;