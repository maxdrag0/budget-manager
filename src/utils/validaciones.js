// export default Validations (){

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     const isValidEmail = emailRegex.test(inputValue);
//     const [debouncedValue, setDebouncedValue] = useState(value);
//     useEffect(() => {
//       const handler = setTimeout(() => {
//         setDebouncedValue(value);
//       }, delay);
//       return () => {
//         clearTimeout(handler);
//       };
//     }, [value, delay]);
//     return debouncedValue;
// )}

const [error, setError] = useState("");
export default function validateInput(value) {
  if (value.length < 3) {
    setError("El texto debe tener al menos 3 caracteres");
  } else {
    setError("");
  }
}

// {
//   error ? (
//     <Text accessibilityRole="alert" style={{ color: "red", marginTop: 4 }}>
//       {error}
//     </Text>
//   ) : null;
// }
