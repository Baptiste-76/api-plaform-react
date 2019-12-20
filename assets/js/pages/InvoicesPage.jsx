import moment from "moment";
import React, { useEffect, useState } from 'react';
import Pagination from '../components/Pagination';
import InvoicesAPI from "../services/invoicesAPI";
import { Link } from "react-router-dom";

const STATUS_CLASSES = {
    PAID: "success",
    SENT: "info",
    CANCELLED: "danger"
}

const STATUS_LABELS = {
    PAID: "Payée",
    SENT: "Envoyée",
    CANCELLED: "Annulée"
}

const InvoicesPage = (props) => {

    const [invoices, setInvoices] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");
    const itemsPerPage = 10;

    // Permet de récupérer les factures
    const fetchInvoices = async () => {
        try {
            const data = await InvoicesAPI.findAll();
            setInvoices(data);
        } catch (error) {
            console.log(error.response);
        }
    };

    // Au chargement du composant, on va chercher les factures en appelant la fonction fecthInvoices()
    useEffect( () => {
        fetchInvoices();
    }, []);

    // Gestion de la suppression d'une facture
    const handleDelete = async id => {
        // Avant de supprimer une facture, je crée une copie de mon tableau de toutes les factures
        const originalInvoices = [...invoices];

        // Je supprime immédiatement de l'affichage la facture dont la suppression a été demandée (pour des soucis de réactivité)
        setInvoices(invoices.filter(invoice => invoice.id !== id));

        // Je demande seulement ensuite la suppression en BDD (j'envoie réellement la requête)
        try {
            await InvoicesAPI.delete(id);
        } catch (error) {
            setInvoices(originalInvoices);
        }
    }

    // Gestion du changement de page
    const handlePageChange = (page) => setCurrentPage(page);

    // Gestion de la recherche
    const handleSearch = event => {
        const value = event.currentTarget.value;
        setSearch(value);
        setCurrentPage(1);
    }

    // Filtrage des factures en fonction de la recherche
    const filteredInvoices = invoices.filter(i => 
        i.customer.firstName.toLowerCase().includes(search.toLowerCase()) ||
        i.customer.lastName.toLowerCase().includes(search.toLowerCase()) ||
        STATUS_LABELS[i.status].toLowerCase().includes(search.toLowerCase()) ||
        i.amount.toString().startsWith(search.toLowerCase())
    );

    // Permet de formater la date d'envoi des factures (grâce à Moment.JS)
    const formatDate = (str) => moment(str).format('DD/MM/YYYY');

    // Pagination des données
    const paginatedInvoices = Pagination.getData(filteredInvoices, currentPage, itemsPerPage);

    return ( 
        <>
            <div className="d-flex justify-content-between align-items-center">
                <h1>Liste des factures</h1>
                <Link className="btn btn-info" to="/invoices/new">Créer une facture</Link>
            </div>

            <div className="form-group">
                <input type="text" onChange={handleSearch} value={search} className="form-control" placeholder="Rechercher..."/>
            </div>

            <table className="table table-hover">
                <thead>
                    <tr>
                        <th>Numéro</th>
                        <th>Client</th>
                        <th className="text-center">Date d'envoi</th>
                        <th className="text-center">Statut</th>
                        <th className="text-center">Montant</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    { paginatedInvoices.map( invoice => 
                        <tr key = { invoice.id }>
                            <td>{ invoice.chrono }</td>
                            <td>
                                <a href="#">{ invoice.customer.firstName } { invoice.customer.lastName }</a>
                            </td>
                            <td className="text-center">{ formatDate(invoice.sentAt) }</td>
                            <td className="text-center">
                                <span className={"badge badge-" + STATUS_CLASSES[invoice.status]}>{ STATUS_LABELS[invoice.status] }</span>
                            </td>
                            <td className="text-center">{ invoice.amount.toLocaleString() }</td>
                            <td>
                                <Link to={"/invoices/" + invoice.id } className="btn btn-sm btn-info mr-1">Éditer</Link>
                                <button onClick={ () => handleDelete(invoice.id) } className="btn btn-sm btn-danger">Supprimer</button>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <Pagination currentPage = {currentPage} itemsPerPage = { itemsPerPage} onPageChanged = { handlePageChange} length = { filteredInvoices.length } />
        </>
    );
}
 
export default InvoicesPage;