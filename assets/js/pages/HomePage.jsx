import React from 'react';
import { NavLink } from 'react-router-dom';

const HomePage = (props) => {
    return ( 
        <div className="jumbotron">
            <h1>Bienvenue !</h1>
            <p className="lead">Ce site est destiné à faciliter la gestion de vos factures clients.</p>
            <hr className="my-4"/>
            <p>Inscrivez-vous et commencer dès maintenant à gérer vos clients et leurs factures.</p>
            <p className="lead">
                <NavLink to="/register" className="btn btn-info mr-2">Inscription</NavLink>
                <NavLink to="/login" className="btn btn-success">Connexion</NavLink>
            </p>
        </div>
     );
}
 
export default HomePage;