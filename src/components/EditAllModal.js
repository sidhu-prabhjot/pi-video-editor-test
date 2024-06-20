import {useState} from 'react';
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
    boxShadow: 24,
    p: 4,
    padding: 2,
  };

const EditAllModal = ({
    isOpen,
    onCloseModal,
    handleEditAllAlignmentChange,
    editAllSelected,
    handleYAlignChange, 
    setParentData}) => {

    const [variantLeft, setVariantLeft] = useState("outlined");
    const [variantMiddle, setVariantMiddle] = useState("outlined");
    const [variantRight, setVariantRight] = useState("outlined");

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

    const handleInputChange = (event) => {
        handleYAlignChange(event.target.value);
    }

    const confirmEdit = () => {
        editAllSelected();
        onCloseModal();
    }

    return (

        <Modal
            open={isOpen}
            onClose={onCloseModal}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <div className="edit-selected-container">
                    <div className={"modal-header-container"}>
                        <h2 className={"modal-header-heading"}>Edit Selected: </h2>
                        <div onClick={() => onCloseModal()}>
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
                            onChange={handleInputChange}
                            onBlur={() => {}}
                            />
                        </div>
                    </div>
                    <Button size={"medium"} variant={"contained"} onClick={() => {confirmEdit()}}>Confirm</Button>
                </div>
            </Box>
        </Modal>

    );
}

export default EditAllModal;