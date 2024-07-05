import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark } from '@fortawesome/free-regular-svg-icons';
import { faCirclePlus, faCodeMerge, faClone, faGear, faTrash, faCircleArrowLeft, faCircleArrowRight} from '@fortawesome/free-solid-svg-icons';

import '../styles/Main.css';
import '../styles/List.css';
import '../styles/InfoModal.css';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    height: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    padding: 2,
};

const JsonMetadataModal = ({
    isOpen,
    onCloseModal,
    videoSrc,
    filename,
    importFileType,
    createdAt,
    updatedAt,
    lastUpdatedBy,
    note,
}) => {

    return (
        <div>
            <Modal
                open={isOpen}
                onClose={onCloseModal}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <div className="info-modal-container">
                        <div className={"modal-header-container"}>
                            <h2 className={"modal-header-heading"}>File Metadata</h2>
                            <div onClick={() => onCloseModal()}>
                                <FontAwesomeIcon className="clickable-icon" icon={faCircleXmark} />
                            </div>
                        </div>
                        <div>
                            <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                                <ListItem>
                                    <ListItemAvatar>
                                        <Avatar>
                                            <FontAwesomeIcon className="clickable-icon" icon={faTrash} />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText primary="Video Source" secondary={videoSrc ? "N/A" : videoSrc} />
                                </ListItem>
                                <ListItem>
                                    <ListItemAvatar>
                                        <Avatar>
                                            <FontAwesomeIcon className="clickable-icon" icon={faClone} />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText primary="File Name" secondary={filename} />
                                </ListItem>
                                <ListItem>
                                    <ListItemAvatar>
                                        <Avatar>
                                            <FontAwesomeIcon className="clickable-icon" icon={faCirclePlus} />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText primary="Original Imported File Type" secondary={importFileType} />
                                </ListItem>
                                <ListItem>
                                    <ListItemAvatar>
                                        <Avatar>
                                            <FontAwesomeIcon className="clickable-icon" icon={faCodeMerge} />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText primary="Creation Date" secondary={createdAt} />
                                </ListItem>
                                <ListItem>
                                    <ListItemAvatar>
                                        <Avatar>
                                            <FontAwesomeIcon className="clickable-icon" icon={faGear} />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText primary="Last Update" secondary={updatedAt} />
                                </ListItem>
                                <ListItem>
                                    <ListItemAvatar>
                                        <Avatar>
                                            <FontAwesomeIcon className="clickable-icon" icon={faGear} />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText primary="Last Updated By" secondary={lastUpdatedBy} />
                                </ListItem>
                                <ListItem>
                                    <ListItemAvatar>
                                        <Avatar>
                                            <FontAwesomeIcon className="clickable-icon" icon={faGear} />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText primary="Note" secondary={note} />
                                </ListItem>
                            </List>
                        </div>
                    </div>
                </Box>
            </Modal>
        </div>
    );

}

export default JsonMetadataModal;