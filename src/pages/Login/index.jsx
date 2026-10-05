import './login.css';
import { useState, useEffect, memo } from 'react';
import { useLocation } from 'wouter';
import { useDispatch } from 'react-redux';
import { setUser } from '../../redux/slices/userSlice.js';
import { useFormik } from 'formik';
import { FaArrowRight } from 'react-icons/fa';
import * as Yup from 'yup';
import { apiFetch, setAuthToken } from '../../services/api.js';

export default memo(function Login({ setToken }) {
  const [clickedButton, setClickedButton] = useState(false);
  const [errorMessage, setErrorMessage] = useState();
  const [, setLocation] = useLocation();
  const dispatch = useDispatch();

  const initialValues = {
    userName: '',
    password: '',
  };

  const validationSchema = () =>
    Yup.object().shape({
      userName: Yup.string().required(' Campo obligatorio'),
      password: Yup.string().required(' Campo obligatorio'),
    });

  const onSubmit = async () => {
    setClickedButton(true);
    const body = {
      userName: values.userName,
      password: values.password,
    };

    try {
      const response = await apiFetch('pokemons/users/login', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      const data = await response.json();

      if (!data.message) {
        setAuthToken(data.id);
        dispatch(setUser(data));
        setToken(data.id);
      } else {
        setErrorMessage(data.message);
        setClickedButton(false);
      }
    } catch {
      setErrorMessage('Network or server error');
      setClickedButton(false);
    }
  };

  const formik = useFormik({ initialValues, validationSchema, onSubmit });
  const { handleChange, handleSubmit, handleBlur, values } = formik;

  useEffect(() => {
    if (errorMessage) setErrorMessage(undefined);
  }, [values.password, values.userName]);

  return (
    <div className="main-menu">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Iniciar sesión</h2>
        {!clickedButton ? (
          <>
            <div className="error-box">{errorMessage || null}</div>
            <input
              className={`input-div ${errorMessage ? 'errorMessage' : ''}`}
              type="text"
              name="userName"
              placeholder="Nombre de usuario"
              onBlur={handleBlur}
              onChange={handleChange}
            />
            <input
              className={`input-div ${errorMessage ? 'errorMessage' : ''}`}
              type="password"
              name="password"
              placeholder="Contraseña"
              onBlur={handleBlur}
              onChange={handleChange}
            />
            <div className="actions-box">
              <button
                disabled={!values.password || !values.userName}
                className={`login-button ${!values.userName || !values.password ? 'disabled' : ''}`}
                type="submit"
              >
                <FaArrowRight />
              </button>
              <a onClick={() => setLocation('/Register')}>Crear cuenta</a>
            </div>
          </>
        ) : (
          <svg
            style={{ height: '45px', width: '45px', marginTop: '100px' }}
            fill="hsl(228, 97%, 42%)"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"
              opacity=".25"
            />
            <path d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z">
              <animateTransform
                attributeName="transform"
                type="rotate"
                dur="0.75s"
                values="0 12 12;360 12 12"
                repeatCount="indefinite"
              />
            </path>
          </svg>
        )}
      </form>
    </div>
  );
});
