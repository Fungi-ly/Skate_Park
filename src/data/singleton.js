const { Pool } = require('pg');
require('dotenv').config();


const config = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    max: 20,
    min: 5,
    iddleTimeoutMillis: 15000,
    connectionTimeoutMillis: 2000
}

const singleton = (function() {
    let instance;
    function crearPool() {
        let pool = new Pool(config);
        return pool;
    }
    return {
        getConnection: () => {
            if (!instance) {
                instance = crearPool();
            } else {
                console.log('Ya tenemos pool corriendo.');
            }
            return instance;
        }
    }
})();
module.exports = singleton;