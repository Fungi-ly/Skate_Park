//IMPORTAR DEPENDENCIAS
require('dotenv').config();
const express = require("express");
const expressFileUpload = require('express-fileupload');
const app = express();
const jwt = require('jsonwebtoken');
const secreto = process.env.JWT
const { engine } = require('express-handlebars');
const port = 3000;
const { getUsuarios, updateStatusUsuario, insertUsuario, updateUsuario, deleteUsuario, verUsuario } = require('./src/controller/consultas');
const path = require('path')
const permitFile = ['.gif', '.png', '.jpg', '.jpeg'];
const fs = require("fs");

//BODY PARSER
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// RECURSOS ESTATICOS y MIDDLEWARE
app.use(express.static(__dirname + '/public'));
app.use('/css', express.static(__dirname + '/public/css'));
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist'));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/axios', express.static(__dirname + '/node_modules/axios/dist'));

//PROPIEDADES DE EXPRESS FILE UPLOAD
const efu_properties = {
    limits: { fileSize: 5000000 },
    abortOnLimit: true,
    responseOnLimit: "El peso del archivo que intentas subir supera el limite permitido",
};
app.use(expressFileUpload(efu_properties));


//HANDLEBARS
app.engine('hbs',
    engine({
        defaultLayout: 'main',
        layoutsDir: __dirname + '/views/mainLayout',
        extname: '.hbs',
        helpers: {
            fixInde: function (valor) {
                return parseInt(valor) + 1;
            }
        }
    })
);

app.set('view engine', 'hbs');
app.set('views', './views/layouts');

// CREACION DE RUTAS

// RUTA RAIZ ENCARGADA DE MOSTRAR LA PAGINA PRINCIPAL
app.get('/', (req, res) => {
    res.render('index');
});

// RUTA ENCARGADA DE MOSTRAR REGISTRO
app.get('/registro', (req, res) => {
    res.render('Registro');
});

// RUTA ENCARGADA DE MOSTAR LOGIN
app.get('/login', (req, res) => {
    res.render('Login');
});


//RUT ENCARGADA DE LISTAR Y MODIFICAR
app.get('/admin', async (req, res) => {
    try {
        const usuarios = await getUsuarios();
        console.log(usuarios);
        res.render('Admin', { usuarios });
    } catch (error) {
        res.status(500).send({
            error: `Error en conseguir lista de users en admin... ${error}`,
            code: 500
        })
    }
});

// RUTA GET USUARIOS
app.get('/usuarios', async (req, res) => {
    const respuesta = await getUsuarios();
    res.status(200).send(respuesta);
});



// RUTA ENCARGADA DE EDITAR PERMISOS DE USUARIOS
app.put('/usuarios', async (req, res) => {
    const { id, estado } = req.body
    try {
        const usuarios = await updateStatusUsuario(id, estado);
        res.status(200).send(JSON.stringify(usuarios));
    } catch (error) {
        res.status(500).send(`Error en edicion de usuarios...${error}`);
    }
});



// RUTA ENCARGADA DE INSERTAR USUARIOS
app.post('/registrar', async (req, res) => {

    const { email, nombre, password, password2, experiencia, especialidad } = req.body;
    const { foto } = req.files;
    const { name } = foto;
    const extension = path.extname(name);
    // FILTRO DE IMAGENES /////////////////////////////////////////////

    if (password !== password2) {
        res.status(401).send('<script>alert("Las contraseñas no coinciden."); window.location.href = "/registro"; </script>');
    } else {
        try {
            await insertUsuario(email, nombre, password, experiencia, especialidad, name)
                .then(() => {
                    if (!req.files) {
                        return res.status(400).send('No se han enviado imágenes.');
                    }

                    if (!permitFile.includes(extension)) {
                        return res.status(403).send('Formato inválido.')
                    }
                    foto.mv(`${__dirname}/public/uploads/${name}`, (err) => {
                        if (err) {
                            return res.status(500).send(err);
                        }
                    });
                    res.status(200).send('<script>alert("Se ha registrado con éxito."); window.location.href = "/"; </script>');
                });

        } catch (error) {
            res.status(500).send({
                error: `Algo salió mal... ${error}`,
                code: 500
            })
        }
    }
});


// RUTA PARA AUTENTICAR EN LOGIN
app.post('/autenticar', async (req, res) => {
    const { email, password } = req.body;
    const user = await verUsuario(email, password)
    if (email === '' || password === '') {
        res.status(401).send('<script>alert("Debe llenar ambos campos."); window.location.href = "/login"; </script>');
    } else {

        if (user) {
            if (user.estado === true) {
                const token = jwt.sign(
                    {
                        exp: Math.floor(Date.now() / 1000) + 180,
                        data: user,
                    },
                    secreto
                );
                res.redirect(`/Datos?token=${token}`);
            } else {
                res.status(401).send(`<script>alert("Usuario en estado revisión."); window.location.href = "/login"; localStorage.setItem('token', JSON.stringify("${token}"))</script>`)
            }
        } else {
            res.status(404).send('<script>alert("Usuario no existe o la contraseña está incorrecta."); window.location.href = "/login"; </script>');
        }
    }
});

// RUTA DE DATOS
app.get('/datos', (req, res) => {
    let { token } = req.query;
    jwt.verify(token, secreto, (err, skater) => {
        const { data } = skater;
        if (err) {
            res.status(401).json({
                error: "401 Unauthorized",
                message: err.message,
            });
        } else {
            console.log('DATOS SKATER', skater);
            res.render('Datos', data);
        }
    });
});


// RUTA QUE RANDERISA DATOS DE USUARIO
app.get('/datos_usuario', async (req, res) => {
    const respuesta = await getUsuarios();
    res.send(respuesta);
});


// RUTA PARA ACTUALIZAR DATOS DE USUARIOS

app.post('/actualizar', async (req, res) => {
    let { email, nombre, password, password2, experiencia, especialidad } = req.body;
    if (password !== password2) {
        res.status(401).send('<script>alert("Las contraseñas no coinciden."); window.location.href = "/Login"; </script>');
    } else {
        try {
            await updateUsuario(email, nombre, password, experiencia, especialidad);
            // console.log('datos usuario', usuario)
            res.send('<script>alert("Datos actualizados con éxito."); window.location.href = "/"; </script>');
        } catch (error) {
            res.status(500).send(`Error en actualización de datos... ${error}`)
        }
    }
});

// RUTA PARA BORRAR USUARIO
app.post('/eliminar', async (req, res) => {
    try {
        const { id } = req.query;
        await deleteUsuario(id);
        res.send('<script>alert("Cuenta eliminada con éxito."); window.location.href = "/"; </script>');
    } catch (error) {
        res.status(500).send(`Error en borrar usuario... ${error}`)
    }
});

app.listen(port, () => console.log('Iniciando en puerto: ' + port));