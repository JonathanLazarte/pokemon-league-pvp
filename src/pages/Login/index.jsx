import './login.css'
import { v4 as uuidv4 } from 'uuid';
import { useState, useEffect, memo } from 'react'
import { useLocation } from 'wouter'
import { useDispatch } from 'react-redux';
import { setUser } from '../../redux/slices/userSlice.js';
import { useFormik } from 'formik';
import * as Yup from 'yup'

export default memo(function Login(){
	const {VITE_API_URL : API_URL} = import.meta.env;
	const [userName, setUserName] = useState()
	const [password, setPassword] = useState()
	const [actualSection, setActualSection] = useState("Login")
	const [areInputsEmpty, setAreImputsEmpty] = useState(true)
	const [path, setLocation] = useLocation();
	const dispatch = useDispatch()
	const initialValues = {
        userName: "",
        password: ""
    }

    const validationSchema = ()=>
        Yup.object().shape({
        userName: Yup.string().required(" Campo obligatorio"),
        password: Yup.string().required(" Campo obligatorio")
    })
    const onSubmit = (e)=>{
		e.preventDefault;
		const body = {
			userName : values.userName,
			password : values.password,
		}
		fetch(`${API_URL}pokemons/users/login`,{method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body)}).then(response=>response.json()).then(data=>{
			if(!data.message){
			localStorage.setItem('token', (data.id));
			localStorage.setItem('userName', (data.userName));
			dispatch(setUser(data))
			setLocation('/')}
			})
	} 
    const formik = useFormik({initialValues, validationSchema, onSubmit});
    const {handleChange, handleSubmit, errors, handleBlur, touched, values, setFieldValue} = formik;

	useEffect(()=>{
		if(userName === undefined && password === undefined){ setAreImputsEmpty(true) } else{ setAreImputsEmpty(false) }
	},[userName, password])

	
	/*return (
	<div className="main-menu">

		{actualSection == "Login" && <form className="login-form">

			<h1>POKEMON LEAGUE</h1>

			<div className="input-div">
			<span>Nombre de usuario</span>
			<input type="text" value={userName} onChange={(e)=>{setUserName(e.currentTarget.value)}}></input>
			</div>

			<div className="input-div">
			<span>Contraseña</span>
			<input type="password" value={password} onChange={(e)=>{setPassword(e.currentTarget.value)}}></input>
			</div>

			<button onClick={handleLogin} className={areInputsEmpty ? "enabled" : null}>Iniciar Sesión</button> <span>No tenés una cuenta? <a onClick={()=>setActualSection("Register")}>Registrarse</a></span>

		</form>}		

	</div>)*/

	return <div className="main-menu">
    <form onSubmit={handleSubmit}className="login-form">
    <h2>Pokemon League</h2>
    	<input
    	 className="input-div"
    	 type="text"
    	 name="userName"
    	 placeholder="Nombre de usuario"
         onBlur={handleBlur}
    	 onChange={handleChange}></input>
         {errors.userName && touched.userName && <div>{errors.userName}</div>}
    	<input
    	 className="input-div"
    	 type="password"
    	 name="password"
    	 placeholder="Contraseña"
         onBlur={handleBlur}
    	 onChange={handleChange}></input>
         {errors.password && touched.password && <div>{errors.password}</div>}
    	<div><a onClick={()=>setLocation('/Register')}>No tengo cuenta</a><button className="login-button" type="submit">Iniciar Sesión</button></div>
        {/*<Link preload="true" to ="/Register">Registrarse</Link>*/}
    </form>
    </div>
})



