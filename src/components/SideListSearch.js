import { useState } from 'react';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Autocomplete from '@mui/material/Autocomplete';
import '../styles/SearchBar.css';

const SideListSearch = ({ dataObjects, onHandleResultClick }) => {

    const handleResultClick = (event, value) => {
        if (value) {
            onHandleResultClick(value.startTime);
        }
    }

    return (
        <div className="search-bar-container">
            <Stack spacing={2} sx={{ width: 250 }}>
                <Autocomplete
                    className="search-bar"
                    id="free-solo-demo"
                    freeSolo
                    options={dataObjects}
                    getOptionLabel={(option) => option.content}
                    renderOption={(props, option) => (
                        <li {...props} key={option.startTime}>
                            {option.content}
                        </li>
                    )}
                    onChange={handleResultClick}
                    renderInput={(params) => <TextField {...params} label="Search subtitle..." />}
                />
            </Stack>
        </div>
    );
}

export default SideListSearch;
