import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import SingleInputForm from './SingleInputForm';
import '../styles/Main.css';

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

const EditAllModal = ({isOpen, onCloseModal, handleEditAllAlignmentChange, editAllSelected, handleYAlignChange, setParentData}) => {

    return (

        <Modal
            open={isOpen}
            onClose={onCloseModal}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <div className="edit-selected-container">
                    <p>Edit Selected: </p>
                    <div>
                        X-Align:
                        <button id={`edit-all-left-align`} style={{backgroundColor: "#ffffff"}} onClick={() => {
                        handleEditAllAlignmentChange("left", `edit-all-left-align`);
                        }}>Left</button>
                        <button  id={`edit-all-middle-align`} style={{backgroundColor: "#ffffff"}} onClick={() => {
                        handleEditAllAlignmentChange("center", `edit-all-middle-align`);
                        }}>Middle</button>
                        <button  id={`edit-all-right-align`} style={{backgroundColor: "#ffffff"}} onClick={() => {
                        handleEditAllAlignmentChange("right", `edit-all-right-align`)
                        }}>Right</button>
                    </div>
                    <div style={{display:"flex", flexDirection:"row"}}>
                        Y-Align:
                        <SingleInputForm
                        placeholder={"-1"}
                        handleChange={handleYAlignChange}
                        subtitleObject={null}
                        setParentData={setParentData}
                        />
                    </div>
                    <button onClick={() => editAllSelected()}>Confirm</button>
                </div>
            </Box>
        </Modal>

    );
}

export default EditAllModal;