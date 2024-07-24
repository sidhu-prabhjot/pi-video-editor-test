import { TimelineAction, TimelineRow} from '@xzdarcy/react-timeline-editor';
import {useState, useEffect} from 'react';


//material UI Components
import Button from '@mui/material/Button';

//fontawesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileLines} from '@fortawesome/free-solid-svg-icons';

//custom components
import DragDrop from '../components/DragDrop';
import TextSubmit from '../components/TextSubmit';
import EditJsonModal from '../components/EditJsonModal';
import InfoModal from '../components/InfoModal';

//data/functions to fetch data for the info modals
import {metaDataInfoData} from '../DataExports/InfoModalData'

import {parseVTTFile, parseSRTFile, parseJSONFile, generateVtt, generateSrt, generateJson} from '../processComponents/Parser';

//styles
import '../timelineStyles/index.less';
import '../styles/List.css';
import '../styles/Main.css';
import '../styles/Subtitle.css';

/////////////////////////////////////////////////////////////////////////////////////////// initialization

const Toolbar = ({
    handleVideoLinkSubmit,
    handleUpdateIdMap,
    handleUpdateSharedData,
    handleVideoLinkChange,
    editedData,
    videoLink,
}) => {

  //REFS:
  
  const [filename, setFilename] = useState("export file");
  const [fileType, setFileType] = useState("");

  //json metadata
  const [metaVideoSrc, setMetaVideoSrc] = useState("");
  const [metaCreatedAt, setMetaCreatedAt] = useState("");
  const [metaUpdatedAt, setMetaUpdatedAt] = useState(null);
  const [metaLastUpdatedBy, setMetaLastUpdatedBy] = useState("");
  const [metaNote, setMetaNote] = useState("");
  const [metaFilename, setMetaFilename] = useState("");
  const [metaImportFileType, setMetaImportFileType] = useState("");

  const [lastUpdatedBy, setLastUpdatedBy] = useState("");
  const [note, setNote] = useState("");

  const [editJsonModalIsOpen, setEditJsonModalIsOpen] = useState(false); 
  const [jsonMetadataModalIsOpen, setJsonMetadataModalIsOpen] = useState(false);

  ////////////////////////////////////////////////////////////////////// exporting subtitles

  //create and download vtt subtitle file from subtitle dataset
  const generateVTT = () => {
    let generatedString = generateVtt(editedData);
    downloadFile(generatedString, "vtt");
  }

  //create and download srt subtitle file from subtitle dataset
  const generateSRT = () => {
    let generatedString = generateSrt(editedData);
    downloadFile(generatedString, "srt");
  }

  //create and download json subtitle file from subtitle dataset
  const generateJSON = (lastUpdatedByInput) => {

    if(lastUpdatedByInput == null || lastUpdatedByInput === "") {
      throw new Error("'last upated by' field is required!")
    }

    //convert subtitle data set to object consisting of sub-objects: metadata and data
    let exportObject = generateJson(editedData, videoLink, filename, fileType, metaCreatedAt, lastUpdatedBy, metaLastUpdatedBy, note, metaNote);

    downloadFile(JSON.stringify(exportObject), "json");
  }

  //download the subtitle file (filetypes include: vtt, srt, json)
  const downloadFile = (generatedString, fileType) => {
    const element = document.createElement("a");
    const file = new Blob([generatedString], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${filename}.${fileType}`;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  }

  // Function to handle a subtitle file drop in file drag-drop
  const onSubtitleFileUpload = (fileObject) => {
    // Initialize a FileReader
    const reader = new FileReader();
    let tempIdMap = {};

    // Define what happens when the file is read successfully
    reader.onload = (event) => {
      try {
        console.log("File load log:", fileObject);

        let result;
        let noFileTypeFilename;

        handleUpdateSharedData([]);

        if (fileObject.name.includes(".vtt")) {
          result = parseVTTFile(reader.result, tempIdMap);
          setFileType("vtt");
          //remove file type ending and store file name 
          noFileTypeFilename = fileObject.name.replace('.vtt', '');
          setFilename(noFileTypeFilename);
        } else if (fileObject.name.includes(".srt")) {
          result = parseSRTFile(reader.result, tempIdMap);
          setFileType("srt");
          //remove file type ending and store file name 
          noFileTypeFilename = fileObject.name.replace('.srt', '');
          setFilename(noFileTypeFilename);
        } else if (fileObject.name.includes(".json")) {
          let initialResult = parseJSONFile(reader.result);
          result = initialResult.data;
          // Set meta data
          setMetaFilename(initialResult.metaData.filename);
          setMetaVideoSrc(initialResult.metaData.videosrc);
          setMetaCreatedAt(initialResult.metaData.createdAt);
          setMetaUpdatedAt(initialResult.metaData.updatedAt);
          setMetaLastUpdatedBy(initialResult.metaData.lastUpdatedBy);
          setMetaNote(initialResult.metaData.note);
          setMetaImportFileType(initialResult.metaData.importFileType);
          setFileType("json");

          noFileTypeFilename = fileObject.name.replace('.json', '');
          setFilename(noFileTypeFilename);

        }

        if (result === undefined) {
          throw new Error("Parsing result is undefined.");
        }

        handleUpdateIdMap({ ...tempIdMap });
        console.log("Parsing result:", result);
        handleUpdateSharedData([...result]);

      } catch (error) {
        console.error("Error while handling file content:", error.message);
      }
    };

    // Read the file as text
    reader.readAsText(fileObject, 'UTF-8');
  };

  //returns button to view JSON metadata if uploaded file is JSON
  const getJSONMetadataButton = () => {
      if(fileType === "json") {
          return <FontAwesomeIcon onClick={() => openJsonMetadataModal()} className={"info-modal-button clickable-icon"} icon={faFileLines} />
      }
          return null;
  }

  ////////////////////////////////////////////////////////////////////handle screen clicks and actions

  //handle updating state when filename input is changed
  const onFilenameInputChange = (event) => {
    setFilename(event.target.value);
  }

  //////////////////////////////////////////////////////// component prop functions

  //handling input change on edit json modal
  const onLastUpdatedByChange = (event) => {
    console.log("last update by set");
    setLastUpdatedBy(event.target.value);
  }

  //handle updating state when note input is changed
  const onNoteChange = (event) => {
    console.log("note set");
    setNote(event.target.value);
  }

  ///////////////////////////////////////////////////////////////// modal functions

  const openEditJsonModal = () => {
    setEditJsonModalIsOpen(true);
  }

  const closeEditJsonModal = () => {
    setEditJsonModalIsOpen(false);
  }

  const openJsonMetadataModal = () => {
    setJsonMetadataModalIsOpen(true);
  }

  const closeJsonMetadataModal = () => {
    setJsonMetadataModalIsOpen(false);
  }

  //////////////////////////////////////////////////////////////////////////// React hooks utilization

  useEffect(() => {
    //once metadata is extracted, set the filename (without file type ending)
    console.log("meta filename changed to: ", metaFilename);
    setFilename(metaFilename);
  }, [metaFilename])


  return (
      <div className={"toolbar-container"}>
        <div style={{zIndex: "9999"}}>
            <EditJsonModal
                isOpen={editJsonModalIsOpen}
                lastUpdatedBy={metaLastUpdatedBy}
                lastUpdatedByInput={lastUpdatedBy}
                note={metaNote}
                handleCloseModal={closeEditJsonModal}
                handleLastUpdatedByChange={onLastUpdatedByChange}
                handleNoteChange={onNoteChange}
                handleConfirm={generateJSON}
            />
        </div>
        <div style={{zIndex: "9999"}}>
            <InfoModal
                isOpen={jsonMetadataModalIsOpen}
                onCloseModal={closeJsonMetadataModal}
                info={metaDataInfoData(metaVideoSrc, metaFilename, metaImportFileType, metaCreatedAt, metaUpdatedAt, metaLastUpdatedBy, metaNote)}
                header={"JSON Metadata"}
            />
        </div>
        <div className={"file-handling-container"}>
          <div className={"drag-drop-container"}>
            <DragDrop handleShowResponseAlert={() => {}} handleVideoUpload={onSubtitleFileUpload} />
          </div>
          <div className={"autoscroll-switch-container"}>
            <div>
              <TextSubmit handleInputChange={onFilenameInputChange} handleSubmit={() => {}} submitButtonText={""} label={"File Name"} displaySubmitButton={false} value={filename}/>
            </div>
            <div>
              <Button size={"small"} className={"button export-button"} variant={"contained"} onClick={() => generateVTT()}>Export VTT</Button>
              <Button size={"small"} className={"button export-button"} variant={"contained"} onClick={() => generateSRT()}>Export SRT</Button>
              <Button size={"small"} className={"button export-button"} variant={"contained"} onClick={() => openEditJsonModal()}>Export JSON</Button>
            </div>
            {getJSONMetadataButton()}
          </div>
        </div>
        <TextSubmit handleInputChange={(event) => handleVideoLinkChange(event)} handleSubmit={handleVideoLinkSubmit} submitButtonText={"Insert"} label={"Video Link"} displaySubmitButton={true} value={videoLink}/>
      </div>
  );
};

export default Toolbar;
