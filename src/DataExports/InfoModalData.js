import { faCirclePlus, faCodeMerge, faClone, faGear, faTrash, faCircleArrowLeft, faCircleArrowRight} from '@fortawesome/free-solid-svg-icons';

//editor usage instructions info modal data
export const usageInfoData = [
    {icon: faTrash, primaryText:"Delete Subtitle", secondaryText:"Remove subtitle from the list."},
    {icon: faClone, primaryText:"Split Subtitle", secondaryText:"Split a subtitle in half within the original subtitle's start and end time."},
    {icon: faCirclePlus, primaryText:"Insert Subtitle", secondaryText:"Insert a subtitle directly after the subtitle that the insert button belongs to."},
    {icon: faCodeMerge, primaryText:"Merge Subtitles", secondaryText:"Combine the subtitle to which the merge button belongs to, and the next subtitle. This will be done within the start time of the first subtitle and the end time of the second subtitle."},
    {icon: faGear, primaryText:"Advanced Edit", secondaryText:"Opens the advanced options menu for a subtitle, which included subtitle positioning."},
    {icon: faCircleArrowLeft, primaryText:"Traverse Selected Up", secondaryText:"Moves to the next selected subtitle up/back in the subtitle list."},
    {icon: faCircleArrowRight, primaryText:"Traverse Selected Down", secondaryText:"Moves to the next selected subtitle down/forward in the subtitle list."},
]

//json file metadata info modal data
export const metaDataInfoData = (videoSrc, filename, importFileType, createdAt, updatedAt, lastUpdatedBy, note) => { 
    return [
    {icon: faTrash, primaryText:"Video Source", secondaryText: videoSrc},
    {icon: faTrash, primaryText:"File Name", secondaryText: filename},
    {icon: faTrash, primaryText:"Original Imported File Type", secondaryText: importFileType},
    {icon: faTrash, primaryText:"Creation Date", secondaryText: createdAt},
    {icon: faTrash, primaryText:"Last Update", secondaryText: updatedAt},
    {icon: faTrash, primaryText:"Last Updated By", secondaryText: lastUpdatedBy},
    {icon: faTrash, primaryText:"Note", secondaryText: note},
    ]
};

