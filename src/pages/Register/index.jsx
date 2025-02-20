import { v4 as uuidv4 } from 'uuid';
import {useState, useEffect} from 'react'
import {useLocation} from 'wouter'
import { useFormik } from 'formik';
import * as Yup from 'yup'
import { useDispatch } from 'react-redux';
import { setUser } from '../../redux/slices/userSlice.js';

export default function Login(){
	const {VITE_API_URL : API_URL} = import.meta.env;
	const [userName, setUserName] = useState()
	const [password, setPassword] = useState()
	const [actualSection, setActualSection] = useState("Login")
	const [areInputsEmpty, setAreImputsEmpty] = useState(true)
	const [path, setLocation] = useLocation();
	const dispatch = useDispatch();
	const initialValues = {
        userName: "",
        password: ""
    }

    const validationSchema = ()=>
        Yup.object().shape({
        userName: Yup.string("Formato incorrecto").required(" Campo obligatorio").min(6, "Debe tener al menos 6 caracteres"),
        password: Yup.string().required(" Campo obligatorio")
    })

	const onSubmit = (e)=>{
		e.preventDefault;
		const body = {
			userName : values.userName,
			password : values.password,
			id : uuidv4(),
			alias: values.userName,
			tag: 'LAS',
			title: 'Novice',
			pokemon : [],
			items : [],
			messages: [
				{
					to: values.userName,
					from: "ShakaDev",
					message: `Hola ${values.userName}! te doy la bienvenida a Pokemon League`
				},
				{
					to: values.userName,
					from: "ShakaDev",
					message: `Podes usar este chat para dejar cualquier sugerencia, opinión o pregunta :)`
				}
			],
			level: 1,
			EXP: 0,
			BE: 20000,
			RP: 3000,
			rank: {
				name: "Bronze",
				level: 4,
				points: 100
			},
			profileIcon: '5909',
			background: 'Aatrox_30',
		}
		fetch(`${API_URL}pokemons/users/register`,{method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body)}).then(response=>response.json()).then(data=>{
			if(!data.message){
			localStorage.setItem('token', (data.id));
			localStorage.setItem('userName', (data.userName));
			console.log(data);
			dispatch(setUser(data)) 
			setLocation('/') } else {
				alert("Usuario actualmente registrado")
			}  
		})
	}

	const formik = useFormik({initialValues, validationSchema, onSubmit});
    const {handleChange, handleSubmit, errors, handleBlur, touched, values, setFieldValue} = formik;
	
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
    	<div><a onClick={()=>setLocation('/Login')}>Ya tengo una cuenta</a><button className="login-button" type="submit">Registrarse</button></div>
        {/*<Link preload="true" to ="/Register">Registrarse</Link>*/}
    </form>
    </div>
}