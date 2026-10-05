import { v4 as uuidv4 } from 'uuid';
import { useState } from 'react';
import { useLocation } from 'wouter';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';
import { setUser } from '../../redux/slices/userSlice.js';
import { FaArrowRight } from 'react-icons/fa';
import { apiFetch, setAuthToken } from '../../services/api.js';

export default function Register({ setToken }) {
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
      userName: Yup.string()
        .required(' Campo obligatorio')
        .min(6, 'Debe tener al menos 6 caracteres'),
      password: Yup.string().required(' Campo obligatorio'),
    });

  const onSubmit = async () => {
    setClickedButton(true);
    const body = {
      userName: values.userName,
      password: values.password,
      id: uuidv4(),
      alias: values.userName,
      tag: 'LAS',
      title: 'Novice',
      pokemon: [],
      items: [],
      messages: [],
      level: 1,
      EXP: 0,
      BE: 20000,
      RP: 3000,
      rank: {
        name: 'Bronze',
        level: 4,
        points: 100,
      },
      profileIcon: '5909',
      background: 'Aatrox_30',
    };

    try {
      const response = await apiFetch('pokemons/users/register', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      const data = await response.json();

      if (!data.message) {
        setAuthToken(data.id);
        setToken(data.id);
        dispatch(setUser(data));
        setLocation('/');
      } else {
        setErrorMessage('Usuario actualmente registrado.');
        setClickedButton(false);
      }
    } catch {
      setErrorMessage('Error al conectar con el servidor.');
      setClickedButton(false);
    }
  };

  const formik = useFormik({ initialValues, validationSchema, onSubmit });
  const { handleChange, handleSubmit, handleBlur, values } = formik;

  return (
    <div className="main-menu">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Registrarse</h2>
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
              <a onClick={() => setLocation('/Login')}>Ya tengo una cuenta</a>
            </div>
          </>
        ) : (
          <svg
            style={{ height: '45px', width: '45px' }}
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
}