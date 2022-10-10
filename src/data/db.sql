CREATE DATABASE skatepark;
\c skatepark

CREATE TABLE skater (
    id SERIAL PRIMARY KEY,
    email VARCHAR(50) UNIQUE NOT NULL, 
    nombre VARCHAR(25) NOT NULL, 
    password VARCHAR(25) NOT NULL,
    anos_experiencia INT NOT NULL, 
    especialidad VARCHAR(50) NOT NULL, 
    foto VARCHAR(255) NOT NULL, 
    estado BOOLEAN NOT NULL
);

INSERT INTO skater (email, nombre, password, anos_experiencia, especialidad, foto, estado) VALUES ('tonyhawk@skate.com', 'Tony Hawk', '123', 12, 'Kickflip', 'tony.jpg', false);
INSERT INTO skater (email, nombre, password, anos_experiencia, especialidad, foto, estado) VALUES ('b@b.com', 'Evelien Bouilliart', '123', 10, 'Heelflip', 'Evelien.jpg', false);