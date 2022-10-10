const singleton = require('../data/singleton');


let pool = singleton.getConnection();

//MOSTRANDO USUARIOS
const getUsuarios = async () => {
    const consulta = {
        text:'SELECT id, foto, nombre, anos_experiencia, especialidad, estado FROM skater ORDER BY id',
        values:[]
    }
    try {
        const result = await pool.query(consulta);
        return result.rows;
    } catch (error) {
        return error;
    }
};


//INSERTANDO USUARIO
const insertUsuario = async (email, nombre, password, experiencia, especialidad, foto) => {
    const consulta = {
        text:'INSERT INTO skater (email, nombre, password, anos_experiencia, especialidad, foto, estado) VALUES ($1, $2, $3, $4, $5, $6, false) RETURNING *',
        values:[email, nombre, password, experiencia, especialidad, foto]
    }
    try {
        const result = await pool.query(consulta);
        return result.rows[0];
    } catch (error) {
            console.log(error)
    }
};



//CAMBIANDO PERMISOS DE USUARIO 
const updateStatusUsuario = async (id, estado) => {
    const consulta = {
        text: "UPDATE skater SET estado=$2 WHERE id=$1 RETURNING *",
        values: [id, estado]
    }
    try {
        const result = await pool.query(consulta);
        return result.rows[0];
    } catch (error) {
        console.log(error)
    }
};

//INSERTANDO USUARIO
const updateUsuario = async (email, nombre, password, experiencia, especialidad) => {
    const consulta = {
        text:'UPDATE skater SET nombre = $2, password = $3, anos_experiencia = $4, especialidad = $5 WHERE email = $1',
        values:[email, nombre, password, experiencia, especialidad]
    }
    try {
        const result = await pool.query(consulta);
        return result.rowCount;
    } catch (error) {
            console.log(error)
    }
};

//ELIMINANDO USUARIO
const deleteUsuario = async (id) => {
    const consulta = {
        text:'DELETE FROM skater WHERE id = $1',
        values:[id]
    }
    try {
        const result = await pool.query(consulta);
        return result.rowCount;
    } catch (e) {
        return e;
    }
}


//CONSULTANDO USUARIO POR EMAIL Y PASSWORD
const verUsuario = async (email, password) => {
    const consulta = {
        text:'SELECT id, email, nombre, password, anos_experiencia, especialidad, foto, estado FROM skater WHERE email=$1 AND password=$2',
        values:[email, password]
    }
    try {
        const result = await pool.query(consulta);
        return result.rows[0];
    } catch (error) {
        console.log(error)
    }
};




module.exports = { getUsuarios, updateStatusUsuario, insertUsuario, updateUsuario, deleteUsuario, verUsuario };