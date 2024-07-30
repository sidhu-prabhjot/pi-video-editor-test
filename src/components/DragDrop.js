import {useEffect} from 'react';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';

//fontawesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudArrowUp } from '@fortawesome/free-solid-svg-icons';

import '../styles/DragDrop.css';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const DragDrop = ({handleShowResponseAlert, handleVideoUpload}) => {
  return (
    <div className="upload-button">
      <Button
        component="label"
        role={undefined}
        variant="contained"
        tabIndex={-1}
        size={"medium"}
        sx={{backgroundColor: "#000000"}}
        startIcon={<FontAwesomeIcon icon={faCloudArrowUp} />}
      >
        Upload File (VTT, SRT, JSON)
        <VisuallyHiddenInput onChange={(event) => handleVideoUpload(event.target.files[0])} type="file" />
      </Button>
    </div>
  );
}

export default DragDrop;