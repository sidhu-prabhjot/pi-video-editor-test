import {useState} from 'react';
import SearchBar from 'react-js-search';

const SideListSearch = ({dataObjects, onSearchChange, onSearchClick}) => {

    // const [dataObjects] = useState([ 
    //     {number: 12, name:"Buffon", position: "ST", success: true},
    //     {number: 21, name: "Pirlo", position: "MC", success: false},
    //     {number: 10, name: "Ruiz", position: "MDI"},
    //     {number: 7, name: "Nesta", position: "RB", success: true},
    //     {number: 4, name: "Cannavaro", position: "CB"},
    //     {number: 2, name: "Puyol", position: "CB", success: false},
    //     {number: 15, name: "Abate", position: "LB"},
    //     {number: 16, name: "Locatelli", position: "MDI"},
    //     {number: 1, name: "Buffon", position: "GK"},
    //     {number: 21, name: "Pirlo", position: "MC"},
    //     {number: 10, name: "Ruiz", position: "MDI"},
    //     {number: 7, name: "Nesta", position: "RB"}
    //   ]);

    return (

        <SearchBar 
            onSearchTextChange={ (term,hits) => {onSearchChange(term,hits)}}
            onSearchButtonClick={onSearchClick}
            placeHolderText={"Search here..."}
            data={dataObjects}
        />

    );

}

export default SideListSearch;