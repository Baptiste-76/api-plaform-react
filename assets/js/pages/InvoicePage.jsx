import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Field from '../components/forms/Field';
import Select from '../components/forms/Select';
import customersAPI from '../services/customersAPI';
import invoicesAPI from '../services/invoicesAPI';
import { toast } from 'react-toastify';
import FormContentLoader from '../components/loaders/FormContentLoader';

const InvoicePage = ({history, match}) => {

    const { id = "new" } = match.params;
    const [invoice, setInvoice] = useState({
        amount: "",
        customer: "",
        status: "SENT"
    })

    const [errors, setErrors] = useState({
        amount: "",
        customer: "",
        status: ""
    })
    const [customers, setCustomers] = useState([])
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(true);

    // Récupération des clients
    const fecthCustomers = async () => {
        try {
            const data = await customersAPI.findAll();
            setCustomers(data);
            setLoading(false);

            if (!invoice.customer) {
                setInvoice({...invoice, customer: data[0].id });
            }
        } catch (error) {
            toast.error("Une erreur est survenue ! ⚠");
            history.replace('/invoices');
        }
    }

    // Récupération d'une facture
    const fetchInvoice = async id => {
        try {
            const { amount, customer, status } = await invoicesAPI.find(id);
            setInvoice({amount, status, customer: customer.id});
            setLoading(false);
        } catch (error) {
            toast.error("Impossible d'obtenir la facture demandée ! ⚠");
            history.replace('/invoices');
        }
    }

    // Récupération de la liste des clients à chaque chargement du composant
    useEffect( () => {
        fecthCustomers();
    }, [])

    // Récupération de la bonne facture quand l'identifiant de l'URL change
    useEffect( () => {
        if(id !== "new") {
            fetchInvoice(id);
            setEditing(true);
        }
    }, [id])


    // Gestion des changements des Inputs dans le formulaire
    const handleChange = ({ currentTarget }) => {
        const {name, value} = currentTarget;
        setInvoice({...invoice, [name]: value})
    };

    // Gestion de la soumission du formulaire
    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setErrors({});
            
            if (editing) {
                await invoicesAPI.update(id, invoice);
                toast.success("La facture a bien été modifiée ! 👌");
            } else {
                await invoicesAPI.create(invoice);
                toast.success("La facture a bien été créée ! 👌");
                history.replace("/invoices");
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
            }
        }
    }

    return ( 
        <>
            {editing && <h1>Modification d'une facture</h1> || <h1>Création d'une facture</h1>}
            { loading && <FormContentLoader />}

            { !loading && <form onSubmit={handleSubmit}>
                <Field name="amount" type="number" placeholder="Montant de la facture" label="Montant" onChange={handleChange} value={invoice.amount} error={errors.amount} />
                <Select name="customer" label="Client" value={invoice.customer} error={errors.customer} onChange={handleChange} >
                    {customers.map( customer => 
                        <option key={customer.id} value={customer.id}>{customer.firstName} {customer.lastName}</option>
                    )}
                </Select>
                <Select name="status" label="Statut" value={invoice.status} error={errors.status} onChange={handleChange} >
                    <option value="SENT">Envoyée</option>
                    <option value="PAID">Payée</option>
                    <option value="CANCELLED">Annulée</option>
                </Select>
                <div className="form-group">
                    <button type="submit" className="btn btn-success">Enregistrer</button>
                    <Link to="/invoices" className="btn btn-link">
                        Retour aux factures
                    </Link>
                </div>
            </form> }
        </>
     );
}
 
export default InvoicePage;