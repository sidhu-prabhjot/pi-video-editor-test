import React, { useState } from "react";
import { FileUploader } from "react-drag-drop-files";

const fileTypes = ["VTT", "SRT"];

function DragDrop({onVideoUpload}) {

  return (
    <FileUploader handleChange={(file) => {
        onVideoUpload(file);
    }} name="file" types={fileTypes} />
  );
}

export default DragDrop;