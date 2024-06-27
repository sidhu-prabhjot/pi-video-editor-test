import { useState } from 'react';
//components
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark } from '@fortawesome/free-regular-svg-icons';
import { faCirclePlus, faCodeMerge, faClone } from '@fortawesome/free-solid-svg-icons';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

//styling
import '../styles/Main.css';
import '../styles/List.css';

const ListItem = ({
    subtitleObject,
    onHandleStartTimeChange,
    onSetParentData,
    onHandleChange,
    onHandleEndTimeChange,
    onHandleLinePositionChange,
    deleteSubtitle,
    handleListClick,
    openModal,
    handleAlignmentChange,
    onHandleMerge,
    onHandleSplit,
    onHandleDisplayListLoader,
}) => {

    const [checked, setChecked] = useState(false);
    const [display, setDisplay] = useState("none");

    const onClickChange = () => {
        subtitleObject.data.toEdit = !subtitleObject.data.toEdit;
        setChecked(subtitleObject.data.toEdit);
    };
    
    const onHandleInputChange = (event) => {
        onHandleChange(event.target.value, subtitleObject);
    };

    const onHandleStartTimeInputChange = (event) => {
        onHandleStartTimeChange(event.target.value, subtitleObject);
    };

    const onHandleEndTimeInputChange = (event) => {
        onHandleEndTimeChange(event.target.value, subtitleObject);
    };

    const onHandleHorizontalAlignment = (alignment) => {
        handleAlignmentChange(subtitleObject, alignment);
    };

    const onHandleLinePositionInputChange = (event) => {
        onHandleLinePositionChange(event.target.value, subtitleObject);
    };

    const onHandleMergeClick = async () => {
        onHandleDisplayListLoader(true);
        await onHandleMerge(subtitleObject);
        onHandleDisplayListLoader(false);
    };

    const onHandleSplitClick = async () => {
        onHandleDisplayListLoader(true)
        await onHandleSplit(subtitleObject);
        onHandleDisplayListLoader(false);
    };

    const sleep = async (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    return (
        <li id={`${subtitleObject.data.subtitleNumber}-list-item-container`} style={{ backgroundColor: subtitleObject.data.backgroundColor }} onClick={() => handleListClick(subtitleObject)} className="list-item-container" key={subtitleObject.data.subtitleNumber}>
            <div className="toolbar">
                <div className="checkbox-container">
                    <p className="checkbox-text">Edit Select</p>
                    <Checkbox size={"small"} className="checkbox" onChange={onClickChange} checked={subtitleObject.data.toEdit} />
                </div>
                <div onClick={async (e) => {
                    e.stopPropagation();
                    onHandleDisplayListLoader(true);
                    await deleteSubtitle(subtitleObject)
                    onHandleDisplayListLoader(false);
                    }}>
                    <FontAwesomeIcon className="clickable-icon" icon={faCircleXmark} />
                </div>
            </div>
            <div id={`${subtitleObject.data.subtitleNumber}`} className={"list-title-container"} style={{ backgroundColor: "transparent" }}>
                <div className={"time-input-container start-input-container"}>
                    <TextField
                        className={"time-input"}
                        required
                        id="outlined-required"
                        label="Start Time"
                        defaultValue={subtitleObject.start}
                        size={"small"}
                        onChange={onHandleStartTimeInputChange}
                        onBlur={onSetParentData}
                    />
                </div>
                <div className={"title-input-container"}>
                    <TextField
                        className={"title-input"}
                        required
                        id="outlined-required"
                        label="Subtitle Text"
                        defaultValue={subtitleObject.data.name}
                        size={"small"}
                        onChange={onHandleInputChange}
                        onBlur={onSetParentData}
                    />
                </div>
                <div className={"time-input-container end-input-container"}>
                    <TextField
                        className={"time-input"}
                        required
                        id="outlined-required"
                        label="End Time"
                        defaultValue={subtitleObject.end}
                        size={"small"}
                        onChange={onHandleEndTimeInputChange}
                        onBlur={onSetParentData}
                    />
                </div>
            </div>
            <p className={"alignment-title"}>Alignment:</p>
            <div className={"change-alignment-container"}>
                <div className={"alignment-container horizontal-alignment-container"}>
                    <p>Horizontal: </p>
                    <div className={"alignment-button-container"}>
                        <Button size={"small"} variant={subtitleObject.data.alignment === "left" ? "contained" : "outlined"} onClick={(e) => {
                            e.stopPropagation();
                            onHandleHorizontalAlignment("left")
                        }}>Left</Button>
                    </div>
                    <div className={"alignment-button-container"}>
                        <Button size={"small"} variant={subtitleObject.data.alignment === "center" ? "contained" : "outlined"} onClick={(e) => {
                            e.stopPropagation();
                            onHandleHorizontalAlignment("center")
                        }}>Center</Button>
                    </div>
                    <div className={"alignment-button-container"}>
                        <Button size={"small"} variant={subtitleObject.data.alignment === "right" ? "contained" : "outlined"} onClick={(e) => {
                            e.stopPropagation();
                            onHandleHorizontalAlignment("right")
                        }}>Right</Button>
                    </div>
                </div>
                <div className={"alignment-container vertical-alignment-container"}>
                    <TextField
                        required
                        id="outlined-required"
                        label="Vertical"
                        defaultValue={subtitleObject.data.linePosition}
                        size={"small"}
                        onChange={onHandleLinePositionInputChange}
                        onBlur={onSetParentData}
                    />
                </div>
            </div>
            <div 
                className={"add-subtitle-button-container"} 
                onMouseEnter={() => setDisplay("flex")}
                onMouseLeave={() => setDisplay("none")}
            >
                <FontAwesomeIcon onClick={() => onHandleSplitClick()} style={{ display: display }} className={"first-merge-button merge-subtitle-button clickable-icon"} icon={faClone} />
                <div onClick={() => openModal(subtitleObject.end)}>
                    <FontAwesomeIcon style={{ display: display }} className={"add-subtitle-button clickable-icon"} icon={faCirclePlus} />
                </div>
                <FontAwesomeIcon onClick={() => onHandleMergeClick()} style={{ display: display }} className={"second-merge-button merge-subtitle-button clickable-icon"} icon={faCodeMerge} />
            </div>
        </li>
    );
};

export default ListItem;
