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

const InfoModal = ({isOpen, onCloseModal}) => {

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
                            <h2 className={"modal-header-heading"}>Usage</h2>
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
                                    <ListItemText primary="Delete Subtitle" secondary="Remove subtitle from the list." />
                                </ListItem>
                                <ListItem>
                                    <ListItemAvatar>
                                        <Avatar>
                                            <FontAwesomeIcon className="clickable-icon" icon={faClone} />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText primary="Split Subtitle" secondary="Split a subtitle in half within the original subtitle's start and end time." />
                                </ListItem>
                                <ListItem>
                                    <ListItemAvatar>
                                        <Avatar>
                                            <FontAwesomeIcon className="clickable-icon" icon={faCirclePlus} />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText primary="Insert Subtitle" secondary="Insert a subtitle directly after the subtitle that the insert button belongs to." />
                                </ListItem>
                                <ListItem>
                                    <ListItemAvatar>
                                        <Avatar>
                                            <FontAwesomeIcon className="clickable-icon" icon={faCodeMerge} />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText primary="Merge Subtitles" secondary="Combine the subtitle to which the merge button belongs to, and the next subtitle. This will be done within the start time of the first subtitle and the end time of the second subtitle." />
                                </ListItem>
                                <ListItem>
                                    <ListItemAvatar>
                                        <Avatar>
                                            <FontAwesomeIcon className="clickable-icon" icon={faGear} />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText primary="Advanced Edit" secondary="Opens the advanced options menu for a subtitle, which included subtitle positioning." />
                                </ListItem>
                                <ListItem>
                                    <ListItemAvatar>
                                        <Avatar>
                                            <FontAwesomeIcon className="clickable-icon" icon={faCircleArrowLeft} />
                                        </Avatar>                                        
                                        <Avatar>
                                            <FontAwesomeIcon className="clickable-icon" icon={faCircleArrowRight} />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText primary="Traverse Selected" secondary="Moves to the next selected subtitle. Left will move back/up the list and right will move forward/down." />
                                </ListItem>
                            </List>
                        </div>
                    </div>
                </Box>
            </Modal>
        </div>
    );

}

export default InfoModal;