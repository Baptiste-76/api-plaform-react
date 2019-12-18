import React, { useEffect, useState } from 'react';
import axios from "axios";
import Pagination from '../components/Pagination';

const CustomersPageWithPagination = props => {

    const [customers, setCustomers] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const itemsPerPage = 10;

    useEffect( () => {
        axios
            .get(`http://localhost:8000/api/customers?pages=true&count=${itemsPerPage}&page=${currentPage}`)
            .then(response => {
                setCustomers(response.data["hydra:member"]);
                setTotalItems(response.data["hydra:totalItems"]);
                setLoading(false);
            })
            .catch(error => console.log(error.response));
    }, [currentPage]);

    const handleDelete = (id) => {
        // Avant de supprimer un client, je crée une copie de mon tableau de tous les clients
        const originalCustomers = [...customers];

        // Je supprime immédiatement de l'affichage le client dont la suppression a été demandée (pour des cousics de réactivité)
        setCustomers(customers.filter(customer => customer.id !== id));

        // Je demande seulement ensuite la suppression en BDD (j'envoie réellement la requête)
        axios
            .delete("http://localhost:8000/api/customers/" + id)
            .then(response => console.log("OK"))
            // Si la requête échoue, je réaffiche le client supprimé en remplaçant le tableau des clients (désormais éronné) par la copie que j'avais faite
            .catch(error => {
                setCustomers(originalCustomers);
                console.log(error.response)
            });
    }

    const handlePageChange = (page) => {
        if (page !== currentPage) {
            setCurrentPage(page);
            setLoading(true);
        }
    }

    return ( 
        <>
            <h1>Liste des clients (avec pagination via Api Platform)</h1>

            <table className="table table-hover">
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Client</th>
                        <th>Email</th>
                        <th>Entreprise</th>
                        <th className="text-center">Factures</th>
                        <th className="text-center">Montant total</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    { loading && (
                        <tr>
                            <td>
                                Chargement...
                            </td>
                        </tr>
                    )}
                    { !loading && customers.map(customer => 
                        <tr key = {customer.id}>
                            <td>{ customer.id }</td>
                            <td>
                                <a href="#">{ customer.firstName } { customer.lastName }</a>
                            </td>
                            <td>{ customer.email }</td>
                            <td>{ customer.company }</td>
                            <td className="text-center">
                                <span className="badge badge-primary">{ customer.invoices.length }</span>
                            </td>
                            <td className="text-center">{ customer.totalAmount.toLocaleString() } €</td>
                            <td>
                                <button onClick={ () => handleDelete(customer.id) } disabled={ customer.invoices.length > 0 } className="btn btn-sm btn-danger">Suprrimer</button>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <Pagination currentPage = { currentPage } itemsPerPage = { itemsPerPage } length = { totalItems } onPageChanged = { handlePageChange }/>
        </>
     );
}
 
export default CustomersPageWithPagination;