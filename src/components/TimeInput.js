import { useState } from 'react';

const TimeInput = ({ placeholder, handleTimeChange, subtitleObject, setParentData}) => {
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (event) => {
    const newValue = event.target.value;
    setInputValue(newValue);
    handleTimeChange(newValue, subtitleObject);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Form submitted:', inputValue);
  };

  return (
    <form onSubmit={handleSubmit} id={'subtitle-edit-form'}>
      <input
        id={'subtitle-edit-input'}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder={subtitleObject.start}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            handleSubmit(event);
            setParentData();
            setInputValue("");
          }
        }}
      />
    </form>
  );
};

export default TimeInput;
