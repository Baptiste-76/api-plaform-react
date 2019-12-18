import React, { useEffect, useState } from 'react';
import Pagination from '../components/Pagination';
import customersAPI from '../services/customersAPI';

const CustomersPage = props => {

    const [customers, setCustomers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");
    const itemsPerPage = 10;

    // Permet de récupérer les clients
    const fetchCustomers = async () => {
        try {
            const data = await customersAPI.findAll();
            setCustomers(data);
        } catch (error) {
            console.log(error.response);
        }
    }

    // Au chargement du composant, on va chercher les clients en appelant la fonction fecthCustomers()
    useEffect( () => {
        fetchCustomers();
    }, []);

    // Gestion de la suppression d'un client
    const handleDelete = async id => {
        // Avant de supprimer un client, je crée une copie de mon tableau de tous les clients
        const originalCustomers = [...customers];

        // Je supprime immédiatement de l'affichage le client dont la suppression a été demandée (pour des soucis de réactivité)
        setCustomers(customers.filter(customer => customer.id !== id));

        // Je demande seulement ensuite la suppression en BDD (j'envoie réellement la requête)
        try {
            await customersAPI.delete(id)
        } catch (error) {
            setCustomers(originalCustomers);
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

    // Filtrage des clients en fonction de la recherche
    const filteredCustomers = customers.filter(c => 
        c.firstName.toLowerCase().includes(search.toLowerCase()) || 
        c.lastName.toLowerCase().includes(search.toLowerCase()) || 
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        (c.company && c.company.toLowerCase().includes(search.toLowerCase()))
    );

    // Pagination des données
    const paginatedCustomers = Pagination.getData(filteredCustomers, currentPage, itemsPerPage);

    return ( 
        <>
            <h1>Liste des clients</h1>

            <div className="form-group">
                <input type="text" onChange={handleSearch} value={search} className="form-control" placeholder="Rechercher..."/>
            </div>

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
                    { paginatedCustomers.map(customer => 
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

            { itemsPerPage < filteredCustomers.length &&
                <Pagination currentPage = { currentPage } itemsPerPage = { itemsPerPage } length = { filteredCustomers.length } onPageChanged = { handlePageChange }/>
            }
        </>
     );
}
 
export default CustomersPage;