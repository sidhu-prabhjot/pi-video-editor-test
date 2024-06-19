import { LoremIpsum } from 'lorem-ipsum';
import {AutoSizer, List} from 'react-virtualized';
import ListItem from './ListItem';

const SubtitleList = ({
    onHandleChange,
    onHandleEndTimeChange,
    onHandleStartTimeChange,
    onHandleLinePositionChange,
    onSetParentData,
    addToEditList,
    removeFromEditList,
    deleteSubtitle,
    handleListClick,
    openModal,
    handleAlignmentChange,
    onHandleMerge,
    data
}) => {

    return (
        <List
        width={700}
        height={400}
        rowHeight={220}
        rowRenderer={({index, key, style}) =>
            <ListItem 
                onHandleChange={onHandleChange()}
                onHandleEndTimeChange={onHandleEndTimeChange()}
                onHandleStartTimeChange={onHandleStartTimeChange()}
                onHandleLinePositionChange={onHandleLinePositionChange()}
                onSetParentData={onSetParentData()}
                addToEditList={addToEditList()}
                removeFromEditList={removeFromEditList()}
                deleteSubtitle={deleteSubtitle()}
                handleListClick={handleListClick()}
                openModal={openModal()}
                handleAlignmentChange={handleAlignmentChange()}
                onHandleMerge={onHandleMerge()}
                index={index()}
                list={data[0].actions}
                key={key}
                style={style}
              />
        }
        rowCount={data[0].actions.length}
        overscanRowCount={3} />
    );

}

export default SubtitleList;