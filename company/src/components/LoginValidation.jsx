function Validation(values) {
  let errors = {};

  if (!values.email) {
    errors.email = "Email is required";
  } else if (!/\S+@\S+\.\S+/.test(values.email)) {
    errors.email = "Email address is invalid";
  }
  
  if (!values.mobile) {
    errors.mobile = "Mobile No. is required";
  } else if (!/^[0-9]{10}$/.test(values.mobile)) {
    errors.mobile = "Mobile address is invalid";
  }

  if (!values.password) {
    errors.password = "Password is required";
  }

  return errors;
}

export default Validation;
