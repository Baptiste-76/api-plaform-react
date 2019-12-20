import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Field from '../components/forms/Field';
import usersAPI from '../services/usersAPI';

const RegisterPage = ({ history }) => {

    const [user, setUser] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        passwordConfirm: ""
    })

    const [errors, setErrors] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        passwordConfirm: ""
    })

    // Gestion des champs
    const handleChange = ({ currentTarget }) => {
        const {name, value} = currentTarget;
        setUser({...user, [name]: value})
    };

    // Gestion de la soumission du formulaire
    const handleSubmit = async (event) => {
        event.preventDefault();

        const apiErrors = {};

        if(user.password !== user.passwordConfirm) {
            apiErrors.passwordConfirm = "Votre confirmation de mot de passe n'est pas identique à votre mot de passe original";
            toast.error("Il y'a des erreurs dans votre formulaire ! ⚠");
        }

        try {
            await usersAPI.register(user);
            setErrors({});
            toast.success("Votre inscription est réussie, vous pouvez maintenant vous connecter ! 😎");
            history.replace('/login');
            
        } catch (error) {
            const {violations} = error.response.data;

            if (violations) {
                violations.forEach(violation => {
                    apiErrors[violation.propertyPath] = violation.message
                });
                setErrors(apiErrors);
                toast.error("Il y'a des erreurs dans votre formulaire ! ⚠");
            }
        }
    }

    return ( 
        <>
            <h1>Inscription</h1>
            <form onSubmit={handleSubmit}>
                <Field name="firstName" label="Prénom" placeholder="Votre prénom" error={errors.firstName} value={user.firstName} onChange={handleChange} />
                <Field name="lastName" label="Nom de fmaille" placeholder="Votre nom de famille" error={errors.lastName} value={user.lastName} onChange={handleChange} />
                <Field name="email" label="Adresse Email" placeholder="Votre adresse email" error={errors.email} value={user.email} onChange={handleChange} type="email" />
                <Field name="password" label="Mot de passe" placeholder="Votre mot de passe" error={errors.password} value={user.password} onChange={handleChange} type="password"/>
                <Field name="passwordConfirm" label="Confirmation du mot de passe" placeholder="Veuillez taper une seconde fois votre mot de passe" error={errors.passwordConfirm} value={user.passwordConfirm} 
                onChange={handleChange} type="password"/>
                <div className="form-group">
                    <button type="submit" className="btn btn-success">Valider mon inscription</button>
                    <Link to="/login" className="btn btn-link">J'ai déjà un compte</Link>
                </div>
            </form>

        </>
     );
}
 
export default RegisterPage;