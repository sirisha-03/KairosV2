export const useDateInput = () => {
    const toInputValue = (dateStr) => {
      if (!dateStr) return "";
      // Handles "YYYY-MM-DD" or "YYYY-MM-DD HH:mm:ss"
      return dateStr.split(" ")[0];
    };
  
    const toBackendValue = (inputDate) => {
      if (!inputDate) return "";
      // Keep as YYYY-MM-DD
      return inputDate;
    };
  
    return { toInputValue, toBackendValue };
  };
  