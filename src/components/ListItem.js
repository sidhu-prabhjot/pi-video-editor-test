import { useState, useEffect } from 'react';
//components
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus, faCodeMerge, faClone, faGear, faTrash} from '@fortawesome/free-solid-svg-icons';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

//styling
import '../styles/Main.css';
import '../styles/List.css';

const ListItem = ({
    subtitleObject,
    currentSubtitle,
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
    measure,
    forceUpdate,
    handleShowResponseAlert,
}) => {

    const [checked, setChecked] = useState(false);
    const [display, setDisplay] = useState(0);

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
        try {
            onHandleDisplayListLoader(true);
            await onHandleMerge(subtitleObject);
            handleShowResponseAlert("successfully merged", "success");
        } catch(error) {
            handleShowResponseAlert("could not merge subtitles", "warning");
        }
    };

    const onHandleSplitClick = async () => {
        try {
            onHandleDisplayListLoader(true);
            await onHandleSplit(subtitleObject);
            handleShowResponseAlert("successfully split", "success");
        } catch(error) {
            handleShowResponseAlert("could not split subtitles", "warning");
        }
    };

    const sleep = async (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    useEffect(() => {
        measure();
    }, [subtitleObject.data.advancedEdit]);

    return (
        <div id={`${subtitleObject.data.subtitleNumber}-list-item-container`} style={{ backgroundColor: subtitleObject.data.backgroundColor}} onClick={async () => {
            currentSubtitle.data.backgroundColor = "#E5E5E5";
            const removeHighlight = async () => {
                onHandleDisplayListLoader();
            }

            await removeHighlight();
            handleListClick(subtitleObject)
            }} className="list-item-container" key={subtitleObject.data.subtitleNumber}>
            <div className="toolbar">
                <div className="checkbox-container">
                    <p className="checkbox-text">{subtitleObject.data.subtitleNumber + 1} | Edit Select</p>
                    <Checkbox size={"small"} className="checkbox" onChange={onClickChange} checked={subtitleObject.data.toEdit} />
                    <div>
                        <FontAwesomeIcon className={"open-advanced-button clickable-icon"} icon={faGear} onClick = {async (e) => {
                            e.stopPropagation();

                            const open = async () => {
                                if(subtitleObject.data.advancedEdit === false) {
                                    subtitleObject.data.advancedEdit = true;
                                } else {
                                    subtitleObject.data.advancedEdit = false;
                                }
                            }
                            await open();
                            await forceUpdate(subtitleObject);
                        }} />
                    </div>
                </div>
                <div onClick={(e) => {
                    e.stopPropagation();
                    try {
                        const handleDeletion = async () => {
                            onHandleDisplayListLoader(true);
                            await deleteSubtitle(subtitleObject);
                        }
                        handleDeletion();
                        handleShowResponseAlert("successfully deleted", "success");
                    } catch (error) {
                        handleShowResponseAlert("could not delete subtitle", "warning");
                    }
                    }}>
                    <FontAwesomeIcon className="clickable-icon" style={{height: "20px"}} icon={faTrash} />
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
                        onClick = {(event) => event.stopPropagation()}
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
                        onClick = {(event) => event.stopPropagation()}
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
                        onClick = {(event) => event.stopPropagation()}
                        onBlur={onSetParentData}
                    />
                </div>
            </div>
            <div className={"change-alignment-container"} style={{display: subtitleObject.data.advancedEdit ? "flex" : "none"}}>
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
                        onClick = {(event) => event.stopPropagation()}
                        onBlur={onSetParentData}
                    />
                </div>
            </div>
            <div 
                className={"add-subtitle-button-container"} 
                onMouseEnter={() => setDisplay(100)}
                onMouseLeave={() => setDisplay(0)}
            >
                <FontAwesomeIcon onClick={() => onHandleSplitClick()} style={{ opacity: display, transition: "opacity 0.2s" }} className={"first-merge-button merge-subtitle-button clickable-icon"} icon={faClone} />
                <div onClick={() => openModal(subtitleObject.end)}>
                    <FontAwesomeIcon style={{ opacity: display, transition: "opacity 0.2s"  }} className={"add-subtitle-button clickable-icon"} icon={faCirclePlus} />
                </div>
                <FontAwesomeIcon onClick={() => onHandleMergeClick()} style={{ opacity: display, transition: "opacity 0.2s"  }} className={"second-merge-button merge-subtitle-button clickable-icon"} icon={faCodeMerge} />
            </div>
        </div>
    );
};

export default ListItem;
