import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Field from '../components/forms/Field';
import customersAPI from "../services/customersAPI";
import { toast } from 'react-toastify';
import FormContentLoader from '../components/loaders/FormContentLoader';

const CustomerPage = ({ match, history }) => {

    const { id = "new" } = match.params;
    const [customer, setCustomer] = useState({
        lastName: "",
        firstName: "",
        email: "",
        company: ""
    })
    const [errors, setErrors] = useState({
        lastName: "",
        firstName: "",
        email: "",
        company: ""
    })
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    // Récupération du client en fonction de l'identifiant
    const fetchCustomer = async id => {
        try {
            const { firstName, lastName, email, company} = await customersAPI.find(id);
            setCustomer({ firstName, lastName, email, company });
            setLoading(false);
        } catch(error) {
            toast.error("Impossible de récupérer les données du client ! ⚠");
            history.replace("/customers");
        }
    }

    // Chargement du client si besoin au chargement du composant ou au changement de l'identifiant (à chaque fois qu'id va changer)
    useEffect( () => {
        if (id !== "new") {
            setEditing(true);
            fetchCustomer(id);
            setLoading(true);
        }  
    }, [id]) 

    // Gestion des changements des Inputs dans le formulaire
    const handleChange = ({ currentTarget }) => {
        const {name, value} = currentTarget;
        setCustomer({...customer, [name]: value})
    }

    // Gestion de la soumission du formulaire
    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setErrors({});

            if (editing) {
                await customersAPI.update(id, customer);
                toast.success("Le client a bien été modifié ! 👌");
            } else {
                await customersAPI.create(customer);
                toast.success("Le client a bien été créé ! 👌");
                history.replace("/customers");
            }
        } catch ({ response }) {
            const { violations } = response.data;

            if(violations) {
                const apiErrors = {};
                violations.forEach(({ propertyPath, message }) => {
                    apiErrors[propertyPath] = message;
                });
                setErrors(apiErrors);
                toast.error("Il y a des erreurs dans votre formulaire ! ❌");
            };
        }
    }

    return ( 
        <>
            {!editing && <h1>Création d'un client</h1> || <h1>Modification d'un client</h1>}
            { loading && <FormContentLoader />}

            { !loading && <form onSubmit={handleSubmit} >
                <Field name="lastName" label="Nom de famille" placeholder="Nom de famille du client" value={customer.lastName} onChange={handleChange} error={errors.lastName} />
                <Field name="firstName" label="Prénom" placeholder="Prénom du client" value={customer.firstName} onChange={handleChange} error={errors.firstName} />
                <Field name="email" label="Email" placeholder="Adresse email du client" type="email" value={customer.email} onChange={handleChange} error={errors.email} />
                <Field name="company" label="Entreprise" placeholder="Entreprise du client" value={customer.company} onChange={handleChange} error={errors.company} />
                <div className="form-group">
                    <button type="submit" className="btn btn-success">Enregistrer</button>
                    <Link to="/customers" className="btn btn-link">Retour à la liste des clients</Link>
                </div>
            </form> }
        </>
     );
}
 
export default CustomerPage;