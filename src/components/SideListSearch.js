import { useState } from 'react';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Autocomplete from '@mui/material/Autocomplete';
import '../styles/SearchBar.css';
import '../styles/Main.css';
import '../styles/List.css';
import '../styles/EditAllModal.css';
import '../styles/TextSubmit.css';

const SideListSearch = ({ searchBarWidth, dataObjects, onHandleResultClick }) => {

    const handleResultClick = (event, value) => {
        if (value) {
            console.log("subtitle clicked from search result: ", value);
            onHandleResultClick(value);
        }
    }

    return (
        <div className="search-bar-container">
            <Stack spacing={2} sx={{width: searchBarWidth }}>
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
                    onChange={handleResultClick}
                    renderInput={(params) => <TextField className={"submit-input"} required id="outlined-required" size={"small"} {...params} label="Search subtitle..." />}
                />
            </Stack>
        </div>
    );
}

export default SideListSearch;
