import { useState } from 'react';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Autocomplete from '@mui/material/Autocomplete';

import '../styles/SearchBar.css';
import '../styles/Main.css';
import '../styles/List.css';
import '../styles/EditAllModal.css';
import '../styles/TextSubmit.css';

/**
 * 
 * @param {integer} searchBarWidth integer value representing the width of the search bar in pixels
 * @param {array} dataObjects an array of data set's subtitleData objects 
 * @param {function} handleResultClick a function to run once a search result is clicked
 * @returns 
 */
const SideListSearch = ({ searchBarWidth, dataObjects, handleResultClick }) => {

    const onResultClick = (event, value) => {
        if (value) {
            console.log("subtitle clicked from search result: ", value);
            handleResultClick(value);
        }
    }

    return (
        <div className={"search-bar-container"}>
            <Stack spacing={2} sx={{
                width: searchBarWidth,
                bgcolor: "#eae9e9",
                borderRadius: "5px",
                }}>
                <Autocomplete
                    className="search-bar"
                    id="free-solo-demo"
                    freeSolo
                    options={dataObjects}
                    getOptionLabel={(option) => option.data.name}
                    renderOption={(props, option) => (
                        <li {...props} key={option.start}>
                            {option.data.name}
                        </li>
                    )}
                    onChange={onResultClick}
                    renderInput={(params) => <TextField className={"submit-input"} required id="outlined-required" size={"small"} {...params} label="Search subtitle..." />}
                />
            </Stack>
        </div>
    );
}

export default SideListSearch;
