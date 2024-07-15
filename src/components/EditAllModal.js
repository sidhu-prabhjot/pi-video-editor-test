import {useState, useEffect} from 'react';

//custom components
import ResponseAlert from './ResponseAlert';

//material ui
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

//fontawesome
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
    boxShadow: 24,
    p: 4,
    padding: 2,
  };

  /**
   * 
   * @param {*} isOpen boolean that indicates if modal is open or closed 
   * @param {function} handleCloseModal function that will close the modal
   * @param {function} handleEditAllAlignmentChange function to handle change to the select horizontal alignment
   * @param {function} handleEditAllLinePositionChange function handle change to the vertical alignment input
   * @param {function} handleEditAllSelected function to apply the vertical and horizontal alignment to all selected subtitles
   * @param {function} setParentData function to apply edits to the subtitle data set
   * @returns 
   */
const EditAllModal = ({
    isOpen,
    handleCloseModal,
    handleEditAllAlignmentChange,
    handleEditAllSelected,
    handleEditAllLinePositionChange, 
    setParentData}) => {

    const [variantLeft, setVariantLeft] = useState("outlined");
    const [variantMiddle, setVariantMiddle] = useState("outlined");
    const [variantRight, setVariantRight] = useState("outlined");
    const [responseAlertText, setResponseAlertText] = useState("");
    const [responseAlertSeverity, setResponseAlertSeverity] = useState("success");
    const [displayResponseAlert, setDisplayResponseAlert] = useState(0);
    const [removeAll, setRemoveAll] = useState(false);

    //makes sure that the error message is hidden before closing the modal
    const closeModal = () => {
        setDisplayResponseAlert(0);
        handleCloseModal();
    }

    //change the selected horizontal button to the selected type, and the rest to the unselected type
    const onHandleHorizontalAlignment = (alignment, elementId) => {
        const textContent = alignment;
        if(textContent === "left") {
            setVariantLeft("contained");
            setVariantMiddle("outlined");
            setVariantRight("outlined");
        } else if (textContent === "center") {
            setVariantLeft("outlined");
            setVariantMiddle("contained");
            setVariantRight("outlined");
        } else {
            setVariantLeft("outlined");
            setVariantMiddle("outlined");
            setVariantRight("contained");
        }
        handleEditAllAlignmentChange(alignment, elementId);
        setParentData();
    }

    const confirmEdit = async () => {
        try {
            await handleEditAllSelected(removeAll);
            closeModal();
        } catch (error) {
            showResponseAlert(error.message, "warning");
        }
    }

    const onCheckboxChange = () => {
        if(removeAll) {
            setRemoveAll(false);
        } else {
            setRemoveAll(true);
        }
    }
    
    //unique to this component, and will only effect this component's alert
    const showResponseAlert = async (responseText, severity) => {
        setResponseAlertText(responseText);
        setResponseAlertSeverity(severity);
        setDisplayResponseAlert(100);
    }

    return (

        <Modal
            open={isOpen}
            onClose={handleCloseModal}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <div className="edit-selected-container">
                    <div className={"modal-header-container"}>
                        <h2 className={"modal-header-heading"}>Edit Selected: </h2>
                        <div onClick={() => closeModal()}>
                            <FontAwesomeIcon className="clickable-icon" icon={faCircleXmark} />
                        </div>
                    </div>
                    <div className={"modal-change-alignment-container"}>
                        <div className={"modal-alignment-container horizontal-alignment-container"}>
                            <p>Horizontal: </p>
                                <div className={"modal-alignment-button-container"}><Button size={"small"} variant={variantLeft} onClick={() => {onHandleHorizontalAlignment("left", `edit-all-left-align`)}}>Left</Button></div>
                                <div className={"modal-alignment-button-container"}><Button size={"small"} variant={variantMiddle} onClick={() => {onHandleHorizontalAlignment("center", `edit-all-center-align`)}}>Center</Button></div>
                                <div className={"modal-alignment-button-container"}><Button size={"small"} variant={variantRight} onClick={() => {onHandleHorizontalAlignment("right", `edit-all-right-align`)}}>Right</Button></div>
                        </div>
                        <div className={"modal-alignment-container vertical-alignment-container"}>
                            <TextField
                            required
                            id="outlined-required"
                            label="Vertical"
                            defaultValue={100}
                            size={"small"}
                            onBlur={(event) => handleEditAllLinePositionChange(event.target.value)}
                            />
                        </div>
                    </div>
                    <div className={"modal-remove-all-container checkbox-container"}>
                        <p className="checkbox-text">Clear Edit List</p>
                        <Checkbox size={"small"} className="checkbox" onChange={onCheckboxChange} checked={removeAll}/>
                    </div>
                    <div className={"response-alert-container"} style={{opacity: displayResponseAlert, display: displayResponseAlert === 0 ? "none" : "flex"}}>
                        <ResponseAlert responseText={responseAlertText} severity={responseAlertSeverity}/>
                    </div>
                    <Button size={"medium"} variant={"contained"} onClick={() => {confirmEdit()}}>Confirm</Button>
                </div>
            </Box>
        </Modal>

    );
}

export default EditAllModal;