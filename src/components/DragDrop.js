import React, { useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import '../styles/DragDrop.css';

const fileTypes = ["VTT", "SRT", "JSON"];

function DragDrop({handleShowResponseAlert, onVideoUpload}) {

  return (
      <FileUploader className={"file-drop"} handleChange={(file) => {
        try {
          onVideoUpload(file);
          handleShowResponseAlert("file contents loaded successfully", "success");
        } catch (error) {
          handleShowResponseAlert("unable to load contents of file", "error")
        }
      }} name="file" types={fileTypes}/>
  );
}

export default DragDrop;