import {useState, useEffect} from 'react';
//components
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark } from '@fortawesome/free-regular-svg-icons';
import { faCirclePlus, faCodeMerge } from '@fortawesome/free-solid-svg-icons';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

//styling
import '../styles/Main.css'
import '../styles/List.css';

const ListItem = ({
    subtitleObject,
    onHandleStartTimeChange,
    onSetParentData,
    onHandleChange,
    onHandleEndTimeChange, 
    onHandleLinePositionChange,
    addToEditList,
    removeFromEditList,
    deleteSubtitle,
    handleListClick,
    openModal,
    handleAlignmentChange,
    onHandleMerge,
}) => {

    const [checked, setChecked] = useState(false);
    const [display, setDisplay] = useState("none");
    const [variantLeft, setVariantLeft] = useState("outlined");
    const [variantMiddle, setVariantMiddle] = useState("outlined");
    const [variantRight, setVariantRight] = useState("outlined");
    

    const onClickChange = () => {
        if(checked) {
            setChecked(false);
        } else {
            setChecked(true);
        }
    }
    
    const onHandleInputChange = (event) => {
        onHandleChange(event.target.value, subtitleObject);
        onSetParentData();
    }

    const onHandleStartTimeInputChange = (event) => {
        onHandleStartTimeChange(event.target.value, subtitleObject);
    }

    const onHandleEndTimeInputChange = (event) => {
        onHandleEndTimeChange(event.target.value, subtitleObject);
    }

    const onHandleHorizontalAlignment = (event) => {
        const textContent = event.target.textContent.toLowerCase();
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
        handleAlignmentChange(subtitleObject, textContent);
    }

    const onHandleLinePositionInputChange = (event) => {
        onHandleLinePositionChange(event.target.value, subtitleObject);
    }

    const onHandleMergeClick = () => {
        onHandleMerge(subtitleObject);
        onSetParentData();
    }

    useEffect(() => {
        if(checked) {
            addToEditList(subtitleObject);
        } else {
            removeFromEditList(subtitleObject.id);
        }
    }, [checked]);

    return (
        <li id={`${subtitleObject.id}-list-item-container`} onClick={() => handleListClick(subtitleObject)} className="list-item-container" key={subtitleObject.id}>
            <div className="toolbar">
                <div className="checkbox-container">
                    <p className="checkbox-text">Edit Select</p>
                    <Checkbox size={"small"} className="checkbox" onChange={onClickChange} checked={checked}/>
                </div>
                <div onClick={() => deleteSubtitle(subtitleObject.id)}>
                    <FontAwesomeIcon className="clickable-icon" icon={faCircleXmark} />
                </div>
            </div>
            <div id={`${subtitleObject.id}`} className={"list-title-container"} style={{ backgroundColor: "transparent" }}>
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
                        <div className={"alignment-button-container"}><Button size={"small"} variant={variantLeft} onClick={onHandleHorizontalAlignment}>Left</Button></div>
                        <div className={"alignment-button-container"}><Button size={"small"} variant={variantMiddle} onClick={onHandleHorizontalAlignment}>Center</Button></div>
                        <div className={"alignment-button-container"}><Button size={"small"} variant={variantRight} onClick={onHandleHorizontalAlignment}>Right</Button></div>
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
                <FontAwesomeIcon style={{display: display}} className={"first-merge-button merge-subtitle-button clickable-icon"} icon={faCodeMerge} />
                <div onClick={() => openModal(subtitleObject.end)}>
                    <FontAwesomeIcon style={{display: display}} className={"add-subtitle-button clickable-icon"} icon={faCirclePlus} />
                </div>
                <FontAwesomeIcon onClick={() => onHandleMergeClick()} style={{display: display}} className={"second-merge-button merge-subtitle-button clickable-icon"} icon={faCodeMerge} />
            </div>
        </li>
    );

}

export default ListItem;