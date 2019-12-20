import React, { useEffect, useState } from 'react';
import Pagination from '../components/Pagination';
import customersAPI from '../services/customersAPI';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import TableLoader from '../components/loaders/TableLoader';

const CustomersPage = props => {

    const [customers, setCustomers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const itemsPerPage = 10;

    // Permet de récupérer les clients
    const fetchCustomers = async () => {
        try {
            const data = await customersAPI.findAll();
            setCustomers(data);
            setLoading(false);
        } catch (error) {
            toast.error("Impossible de récupérer la liste des clients ! ⚠");
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
            toast.success("Le client a bien été supprimé ! ✔");
        } catch (error) {
            setCustomers(originalCustomers);
            toast.error("La suppression du client n'a pas fonctionné ! ⚠")
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
            <div className="mb-3 d-flex justify-content-between align-items-center">
                <h1>Liste des clients</h1>
                <Link to="/customers/new" className="btn btn-info">Créer un client</Link>
            </div>

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
                { !loading && <tbody>
                    { paginatedCustomers.map(customer => 
                        <tr key = {customer.id}>
                            <td>{ customer.id }</td>
                            <td>
                                <Link to={"/customers/" + customer.id} >{ customer.firstName } { customer.lastName }</Link>
                            </td>
                            <td>{ customer.email }</td>
                            <td>{ customer.company }</td>
                            <td className="text-center">
                                <span className="badge badge-info">{ customer.invoices.length }</span>
                            </td>
                            <td className="text-center">{ customer.totalAmount.toLocaleString() } €</td>
                            <td>
                                <Link to={"/customers/" + customer.id } className="btn btn-sm btn-info mr-1">Éditer</Link>
                                <button onClick={ () => handleDelete(customer.id) } disabled={ customer.invoices.length > 0 } className="btn btn-sm btn-danger">Suprrimer</button>
                            </td>
                        </tr>
                    )}
                </tbody> }
            </table>
            { loading && <TableLoader /> }

            { itemsPerPage < filteredCustomers.length &&
                <Pagination currentPage = { currentPage } itemsPerPage = { itemsPerPage } length = { filteredCustomers.length } onPageChanged = { handlePageChange }/>
            }
        </>
     );
}
 
export default CustomersPage;