import React, { useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import '../styles/DragDrop.css';

const fileTypes = ["VTT", "SRT"];

function DragDrop({onVideoUpload}) {

  return (
      <FileUploader className={"file-drop"} handleChange={(file) => {
          onVideoUpload(file);
      }} name="file" types={fileTypes} style={{minWidth:"none"}}/>
  );
}

export default DragDrop;