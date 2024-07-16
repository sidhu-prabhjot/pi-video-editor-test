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
    darkMode,
    subtitleObject,
    currentSubtitle,
    handleStartTimeChange,
    handleSetParentData,
    handleContentInputChange,
    handleEndTimeChange,
    handleDeleteSubtitle,
    handleListClick,
    handleOpenModal,
    handleAlignmentChange,
    handleLinePositionChange,
    handleMerge,
    handleSplit,
    handleDisplayListLoader,
    handleMeasure,
    handleShowResponseAlert,
    forceUpdate,
    handleTimeVerification,
}) => {

    const [checked, setChecked] = useState(false);
    const [display, setDisplay] = useState(0);
    const [startTimeInput, setStartTimeInput] = useState(subtitleObject.start);
    const [endTimeInput, setEndTimeInput] = useState(subtitleObject.end);

    const onCheckboxChange = (event) => {
        event.stopPropagation();
        subtitleObject.data.toEdit = !subtitleObject.data.toEdit;
        setChecked(subtitleObject.data.toEdit);
    };

    //display loader and delete subtitle
    const onHandleDeleteClick = async (event) => {
        event.stopPropagation();
        try {
            await handleDeleteSubtitle(subtitleObject);
            handleShowResponseAlert("successfully deleted", "success");
        } catch (error) {
            handleShowResponseAlert("could not delete subtitle", "warning");
        }
    };

    //display loader and merge two subtitles
    const onHandleMergeClick = async () => {
        try {
            handleDisplayListLoader(true);
            await handleMerge(subtitleObject);
            handleShowResponseAlert("successfully merged", "success");
        } catch(error) {
            handleShowResponseAlert("could not merge subtitles", "warning");
        }
    };

    //display loader and split a subtitle
    const onHandleSplitClick = async () => {
        try {
            handleDisplayListLoader(true);
            await handleSplit(subtitleObject);
            handleShowResponseAlert("successfully split", "success");
        } catch(error) {
            handleShowResponseAlert("could not split subtitles", "warning");
        }
    };

    //show the advanced edit dropdown on list item
    const onOpenAdvancedEdit = async (event) => {
        event.stopPropagation();
        handleListClick(subtitleObject);

        const open = async () => {
            if(subtitleObject.data.advancedEdit === false) {
                subtitleObject.data.advancedEdit = true;
            } else {
                subtitleObject.data.advancedEdit = false;
            }
        }
        await open();
        await forceUpdate(subtitleObject);
    }

    const onListItemClick = async () => {
        currentSubtitle.data.backgroundColor = "#E5E5E5";
        await handleDisplayListLoader();
        handleListClick(subtitleObject);
    }

    //set data when a component input loses focus
    const onOnBlur = () => {
        handleListClick(subtitleObject);
        try {
            //verify that the times entered are valid
            handleTimeVerification(startTimeInput, endTimeInput);

            //only update values in data if they pass verification
            handleStartTimeChange(startTimeInput, subtitleObject);
            handleEndTimeChange(endTimeInput, subtitleObject);
            handleSetParentData();
        } catch(error) {
            handleShowResponseAlert(error.message, "warning");
        }
    }

    useEffect(() => {
        //resizing list item to accomodate the advanced edit dropdown using react virutalized method
        handleMeasure();
    }, [subtitleObject.data.advancedEdit]);

    return (
        <div id={`${subtitleObject.data.subtitleNumber}-list-item-container`} style={{ opacity:`${subtitleObject.data.size}`, backgroundColor: subtitleObject.data.backgroundColor}} onClick={() => onListItemClick()} className="list-item-container" key={subtitleObject.data.subtitleNumber}>
            <div className="toolbar">
                <div className="checkbox-container">
                    <p className="checkbox-text">{subtitleObject.data.subtitleNumber + 1} | Edit Select</p>
                    <Checkbox size={"small"} className="checkbox" onChange={(event) => onCheckboxChange(event)} checked={subtitleObject.data.toEdit} />
                    <div>
                        <FontAwesomeIcon className={"open-advanced-button clickable-icon"} icon={faGear} onClick = {(event) => onOpenAdvancedEdit(event)} />
                    </div>
                </div>
                <div onClick={(event) => onHandleDeleteClick(event)}>
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
                        onChange={(event) => setStartTimeInput(event.target.value)}
                        onClick = {(event) => event.stopPropagation()}
                        onBlur={() => onOnBlur()}
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
                        onChange={(event) => handleContentInputChange(event.target.value, subtitleObject)}
                        onClick = {(event) => event.stopPropagation()}
                        onBlur={() => onOnBlur()}
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
                        onChange={(event) => setEndTimeInput(event.target.value)}
                        onClick = {(event) => event.stopPropagation()}
                        onBlur={() => onOnBlur()}
                    />
                </div>
            </div>
            <div className={"change-alignment-container"} style={{display: subtitleObject.data.advancedEdit ? "flex" : "none"}}>
                <div className={"alignment-container horizontal-alignment-container"}>
                    <p>Horizontal: </p>
                    <div className={"alignment-button-container"}>
                        <Button size={"small"} variant={subtitleObject.data.alignment === "left" ? "contained" : "outlined"} onClick={(e) => {
                            e.stopPropagation();
                            handleAlignmentChange(subtitleObject, "left");
                        }}>Left</Button>
                    </div>
                    <div className={"alignment-button-container"}>
                        <Button size={"small"} variant={subtitleObject.data.alignment === "center" ? "contained" : "outlined"} onClick={(e) => {
                            e.stopPropagation();
                            handleAlignmentChange(subtitleObject, "center");
                        }}>Center</Button>
                    </div>
                    <div className={"alignment-button-container"}>
                        <Button size={"small"} variant={subtitleObject.data.alignment === "right" ? "contained" : "outlined"} onClick={(e) => {
                            e.stopPropagation();
                            handleAlignmentChange(subtitleObject, "right");
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
                        onChange={(event) => handleLinePositionChange(event.target.value, subtitleObject)}
                        onClick = {(event) => event.stopPropagation()}
                        onBlur={() => onOnBlur()}
                    />
                </div>
            </div>
            <div 
                className={"add-subtitle-button-container"} 
                onMouseEnter={() => setDisplay(100)}
                onMouseLeave={() => setDisplay(0)}
            >
                <FontAwesomeIcon onClick={() => onHandleSplitClick()} style={{ opacity: display,}} className={"first-merge-button merge-subtitle-button clickable-icon list-item-action-button"} icon={faClone} />
                <div onClick={() => handleOpenModal(subtitleObject.end)}>
                    <FontAwesomeIcon style={{ opacity: display}} className={"add-subtitle-button clickable-icon list-item-action-button"} icon={faCirclePlus} />
                </div>
                <FontAwesomeIcon onClick={() => onHandleMergeClick()} style={{ opacity: display}} className={"second-merge-button merge-subtitle-button clickable-icon list-item-action-button"} icon={faCodeMerge} />
            </div>
        </div>
    );
};

export default ListItem;
