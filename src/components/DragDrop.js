import { FileUploader } from "react-drag-drop-files";

import '../styles/DragDrop.css';

const fileTypes = ["VTT", "SRT", "JSON"];

/**
 * 
 * @param {*} handleShowResponseAlert function to display alert
 * @param {function} handleVideoUpload function to process file when uploaded successfully
 * @returns 
 */
function DragDrop({handleShowResponseAlert, handleVideoUpload}) {

  return (
      <FileUploader className={"file-drop"} handleChange={(file) => {
        try {
          handleVideoUpload(file);
          handleShowResponseAlert("file contents loaded successfully", "success");
        } catch (error) {
          handleShowResponseAlert("unable to load contents of file", "error")
        }
      }} name="file" types={fileTypes}/>
  );
}

export default DragDrop;