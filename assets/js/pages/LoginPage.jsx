import React, { useContext, useState } from 'react';
import Field from '../components/forms/Field';
import AuthContext from '../contexts/AuthContext';
import authAPI from '../services/authAPI';

const LoginPage = ({ history }) => {

    const { setIsAuthenticated } = useContext(AuthContext);
    const [credentials, setCredentials] = useState({
        username: "",
        password: ""
    })
    const [error, setError] = useState("");

    // Gestion des champs
    const handleChange = ({ currentTarget }) => {
        const {value, name} = currentTarget;
        setCredentials({...credentials, [name]: value});
    };

    // Gestion du Submit
    const handleSubmit = async event => {
        event.preventDefault();

        try {        
            await authAPI.authenticate(credentials);
            setError("");
            setIsAuthenticated(true);
            history.replace("/customers");
        } catch (error) {
            setError("Les information de connexion sont erronnées !");
        }
    };

    return ( 
        <>
            <h1>Connexion à l'application</h1>

            <form onSubmit={ handleSubmit }>
                <Field label="Adresse email" name="username" value={credentials.username} onChange={handleChange} placeholder="Adresse email de connexion" error={error} />
                <Field label="Mot de passe" name="password" value={credentials.password} onChange={handleChange} type="password" />
                <div className="form-group">
                    <button type="submit" className="btn btn-success">Je me connecte !</button>
                </div>
            </form>
        </>
     );
}
 
export default LoginPage;