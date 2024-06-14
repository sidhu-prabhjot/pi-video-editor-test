import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Autocomplete from '@mui/material/Autocomplete';  
import '../styles/SearchBar.css';

const SideListSearch = ({dataObjects}) => {

    return (
        <div className="search-bar-container">
            <Stack spacing={2} sx={{ width: 300}}>
            <Autocomplete
                className={"search-bar"}
                id="free-solo-demo"
                freeSolo
                options={dataObjects.map((option) => option.content)}
                renderInput={(params) => <TextField {...params} label="Search subtitle..." />}
            />
            </Stack>
        </div>

    );

}

export default SideListSearch;