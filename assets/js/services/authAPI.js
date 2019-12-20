import axios from "axios";
import jwtDecode from "jwt-decode";
import customersAPI from "./customersAPI";
import Cache from "./cache";
import { LOGIN_API } from "../config";

/**
 * Requête HTTP d'authentification et stockage du token dans le LocalStorage et sur Axios
 * @param {object} credentials 
 */
function authenticate(credentials) {
    return axios
        .post(LOGIN_API, credentials)
        .then(response => response.data.token)
        .then(token => {
            
            // On stocke le token dans le LocalStorage
            window.localStorage.setItem("authToken", token);
        
            // On prévient axios qu'on a maintenant un header par défaut sur toutes nos futures requêtes HTTP
            setAxiosToken(token);

            customersAPI.findAll().then(data => console.log(data));
         });
}

/**
 * Déconnexion (suppression du token du LocalStorage et sur Axios)
 */
function logout() {
    window.localStorage.removeItem("authToken");
    delete axios.defaults.headers["Authorization"];
    Cache.invalidate("customers");
    customersAPI.findAll().then(data => console.log(data));
}

/**
 * Positionne le token JWT sur Axios
 * @param {string} token Le token JWT
 */
function setAxiosToken(token) {
    axios.defaults.headers["Authorization"] = "Bearer " + token;
}

/**
 * Mise en place lors du chargement de l'application
 */
function setup() {
    // 1. On voit si on a un token
    const token = window.localStorage.getItem("authToken");

    // 2. On voit s'il est toujours valide
    if (token) {
        const jwtData = jwtDecode(token);
        if (jwtData.exp * 1000 > new Date().getTime()) {
            setAxiosToken(token);
        } 
    } 
}

/**
 * Permet de savoir si un utilisateur est authentifié ou pas
 * @returns boolean
 */
function isAuthenticated() {
    // 1. On voit si on a un token
    const token = window.localStorage.getItem("authToken");

    // 2. On voit s'il est toujours valide
    if (token) {
        const jwtData = jwtDecode(token);
        if (jwtData.exp * 1000 > new Date().getTime()) {
            return true;
        } 
        return false;
    } 
    return false;
}

export default {
    authenticate: authenticate,
    logout: logout,
    setup: setup,
    isAuthenticated: isAuthenticated
};