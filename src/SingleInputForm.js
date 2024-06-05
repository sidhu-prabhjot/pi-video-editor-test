import { useState } from 'react';

const SingleInputForm = ({ placeholder, handleChange, subtitleObject, setParentData }) => {
  const [inputValue, setInputValue] = useState(placeholder);

  const handleInputChange = (event) => {
    const newValue = event.target.value;
    setInputValue(newValue);
    handleChange(newValue, subtitleObject);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Form submitted:', inputValue);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            handleSubmit(event);
            setParentData();
          }
        }}
      />
    </form>
  );
};

export default SingleInputForm;
