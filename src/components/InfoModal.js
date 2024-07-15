import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark } from '@fortawesome/free-regular-svg-icons';

//import all data needed for info modal (includes icons)
import '../DataExports/InfoModalData';

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

/**
 * 
 * @param {*} isOpen boolean to track if modal is open or closed
 * @param {function} onCloseModal function that closes the modal by setting isOpen to false
 * @param {object} info array of objects: [{icon: fontAwesome icon element, primaryText: string, secondaryText: string}]
 * @param {string} header modal header
 * @returns 
 */
const InfoModal = ({isOpen, onCloseModal, info, header}) => {

    const getInfoList = () => {
        try {
            return info.map((infoItem, index) => {

                //accessing the icon as an icon instead of object
                var name = 'abc';
                var tempObject = {};
                tempObject[name] = infoItem.icon;

                return (<ListItem key={index}>
                    <ListItemAvatar>
                        <Avatar>
                            <FontAwesomeIcon className="clickable-icon" icon={tempObject[name]}/>
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={infoItem.primaryText} secondary={infoItem.secondaryText} />
                </ListItem>);
            });
        } catch (error) {
            console.log(error);
        } 

    }

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
                            <h2 className={"modal-header-heading"}>{header}</h2>
                            <div onClick={() => onCloseModal()}>
                                <FontAwesomeIcon className="clickable-icon" icon={faCircleXmark} />
                            </div>
                        </div>
                        <div>
                            <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                                {getInfoList()}
                            </List>
                        </div>
                    </div>
                </Box>
            </Modal>
        </div>
    );

}

export default InfoModal;