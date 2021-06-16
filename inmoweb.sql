DROP DATABASE inmoweb;
CREATE DATABASE IF NOT EXISTS inmoweb;
USE inmoweb;



CREATE TABLE usuarios (
    user_uuid VARCHAR(64) NOT NULL,
    id_usuario INT UNSIGNED NOT NULL AUTO_INCREMENT,
    username VARCHAR(64) NOT NULL,
    password VARCHAR(64) NOT NULL,
    email VARCHAR(256) NOT NULL,
    tipo ENUM('INQUILINO','CASERO', 'INQUILINO_CASERO', 'ADMIN') NOT NULL DEFAULT 'INQUILINO',


    CONSTRAINT UNIQUE KEY UK_usuarios_username (username),
    CONSTRAINT UNIQUE KEY UK_usuarios_email (email),
    CONSTRAINT UNIQUE INDEX UI_usuarios (id_usuario),
    CONSTRAINT PK_usuarios PRIMARY KEY(user_uuid)
);



CREATE TABLE inmuebles (
    inmueble_uuid VARCHAR(64) NOT NULL,
    usr_casero_uuid VARCHAR(64) NOT NULL,
    id_inmueble INT UNSIGNED NOT NULL AUTO_INCREMENT,
    direccion VARCHAR(256),
    metros_2 SMALLINT DEFAULT 0,

    CONSTRAINT UNIQUE INDEX UI_inmuebles (id_inmueble),
    CONSTRAINT FK_inmuebles_usr_casero_uuid FOREIGN KEY (usr_casero_uuid) REFERENCES usuarios(user_uuid), 
    CONSTRAINT PK_imnuebles PRIMARY KEY(inmueble_uuid, usr_casero_uuid)
);



CREATE TABLE anuncios (
    anuncio_uuid VARCHAR(64) NOT NULL,
    id_anuncio INT UNSIGNED NOT NULL AUTO_INCREMENT,
    usr_casero_uuid VARCHAR(64) NOT NULL,
    inmueble_uuid VARCHAR(64) NOT NULL,
    fecha_inicio DATETIME NOT NULL,


    CONSTRAINT UNIQUE INDEX UI_anuncios (id_anuncio),
    CONSTRAINT FK_anuncios_inmuebles FOREIGN KEY (inmueble_uuid) REFERENCES inmuebles(inmueble_uuid),
    CONSTRAINT FK_anuncios_usr_casero_uuid FOREIGN KEY (usr_casero_uuid) REFERENCES inmuebles(usr_casero_uuid),
    CONSTRAINT PK_anuncios PRIMARY KEY (anuncio_uuid)
);



CREATE TABLE resenas (
    resena_uuid VARCHAR(64) NOT NULL,
    id_resena INT UNSIGNED NOT NULL AUTO_INCREMENT,
    inmueble_uuid VARCHAR(64) NOT NULL,
    usr_casero_uuid VARCHAR(64) NOT NULL,
    usr_inquilino VARCHAR(64) NOT NULL,
    contenido TEXT,


    CONSTRAINT UNIQUE INDEX UI_resenas (id_resena),
    CONSTRAINT FK_resenas_inmueble FOREIGN KEY (inmueble_uuid) REFERENCES inmuebles(inmueble_uuid),
    CONSTRAINT FK_resenas_usr_uuid_casero FOREIGN KEY (usr_casero_uuid) REFERENCES inmuebles(usr_casero_uuid),
    CONSTRAINT FK_resenas_usr_usuario FOREIGN KEY (usr_inquilino) REFERENCES usuarios(user_uuid),
    CONSTRAINT PK_resenas PRIMARY KEY(resena_uuid)
);



CREATE TABLE reservas (
    reserva_uuid VARCHAR(64) NOT NULL,
    id_reserva INT UNSIGNED NOT NULL AUTO_INCREMENT,
    inmueble_uuid VARCHAR(64) NOT NULL,
    usr_casero_uuid VARCHAR(64) NOT NULL,
    usr_inquilino VARCHAR(64) NOT NULL,
    precio_reserva INT UNSIGNED NOT NULL DEFAULT 0,


    CONSTRAINT UNIQUE INDEX UI_reservas (id_reserva),
    CONSTRAINT FK_reservas_inmueble FOREIGN KEY (inmueble_uuid) REFERENCES inmuebles(inmueble_uuid),
    CONSTRAINT FK_reservas_usr_uuid_casero FOREIGN KEY (usr_casero_uuid) REFERENCES inmuebles(usr_casero_uuid),
    CONSTRAINT FK_reservas_usr_usuario FOREIGN KEY (usr_inquilino) REFERENCES usuarios(user_uuid),
    CONSTRAINT PK_reservas PRIMARY KEY(reserva_uuid)
);



CREATE TABLE alquileres (
    alquiler_uuid VARCHAR(64) NOT NULL,
    id_alquiler INT UNSIGNED NOT NULL AUTO_INCREMENT,
    usr_casero_uuid VARCHAR(64) NOT NULL,
    usr_inquilino_uuid VARCHAR(64) NOT NULL,
    inmueble_uuid VARCHAR(64) NOT NULL,
    fecha_inicio DATETIME NOT NULL,
    fecha_fin DATETIME NOT NULL,


    CONSTRAINT UNIQUE INDEX UI_alquileres (id_alquiler),
    CONSTRAINT FK_alquileres_inmuebles_uuid FOREIGN KEY (inmueble_uuid) REFERENCES inmuebles(inmueble_uuid),
    CONSTRAINT FK_alquileres_usr_casero_uuid FOREIGN KEY (usr_casero_uuid) REFERENCES inmuebles(usr_casero_uuid),
    CONSTRAINT FK_alquileres_usr_inquilino_uuid FOREIGN KEY (usr_inquilino_uuid) REFERENCES usuarios(user_uuid),
    CONSTRAINT PK_alquileres PRIMARY KEY(alquiler_uuid)
);


SET SESSION SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

INSERT INTO usuarios(id_usuario, user_uuid, username, password, email, tipo)
    VALUES(0,'cc77e9e5-4677-4ab6-ace9-902ef8e2e07d','admin','admin1234','asdf@asdf.asdf','ADMIN');
INSERT INTO usuarios(id_usuario, user_uuid, username, password, email, tipo)
    VALUES(null,'fd0f280d-12f4-4561-96b8-8a9850612517','pepe','1234','asdf1@asdf.asdf','INQUILINO');
INSERT INTO usuarios(id_usuario, user_uuid, username, password, email, tipo)
    VALUES(null,'d0f3bb42-fa87-4e3a-89d3-eb608eebc26b','hermeregildo','1234','asdf2@asdf.asdf','CASERO');
INSERT INTO usuarios(id_usuario, user_uuid, username, password, email, tipo)
    VALUES(null,'3983bb27-f996-48a5-9cff-22c14ce6421f','caracaca','1234','asdf3@asdf.asdf','INQUILINO_CASERO');


INSERT INTO inmuebles(inmueble_uuid, usr_casero_uuid, id_inmueble)
    VALUES(
	'0eff0364-291d-4001-b3cc-321725d7cd27',
	'cc77e9e5-4677-4ab6-ace9-902ef8e2e07d',
	null);
INSERT INTO inmuebles(inmueble_uuid, usr_casero_uuid, id_inmueble)
    VALUES(
	'7fc9832c-5c48-4a0b-9784-d7d69d4e8f61',
	'cc77e9e5-4677-4ab6-ace9-902ef8e2e07d',
	null);
INSERT INTO inmuebles(inmueble_uuid, usr_casero_uuid, id_inmueble)
    VALUES(
	'c9345c00-d3fc-43d6-b149-8a44f7a691c7',
	'cc77e9e5-4677-4ab6-ace9-902ef8e2e07d',
	null);
INSERT INTO inmuebles(inmueble_uuid, usr_casero_uuid, id_inmueble)
    VALUES(
	'90beefa2-9d36-4c02-889b-9df2414439de',
	'd0f3bb42-fa87-4e3a-89d3-eb608eebc26b',
	null);
INSERT INTO inmuebles(inmueble_uuid, usr_casero_uuid, id_inmueble)
    VALUES(
	'4929f456-7039-4dee-b2ad-39d8fa92a675',
	'd0f3bb42-fa87-4e3a-89d3-eb608eebc26b',
	null);
INSERT INTO inmuebles(inmueble_uuid, usr_casero_uuid, id_inmueble)
    VALUES(
	'a38e5b1e-e809-492a-b183-836d17143b22',
	'd0f3bb42-fa87-4e3a-89d3-eb608eebc26b',
	null);
INSERT INTO inmuebles(inmueble_uuid, usr_casero_uuid, id_inmueble)
    VALUES(
	'e897672a-403e-4e28-90e9-1092467aa1e0',
	'3983bb27-f996-48a5-9cff-22c14ce6421f',
	null);
INSERT INTO inmuebles(inmueble_uuid, usr_casero_uuid, id_inmueble)
    VALUES(
	'2fa0e1cd-3ea3-424a-84fb-6ad170ee94ce',
	'3983bb27-f996-48a5-9cff-22c14ce6421f',
	null);
INSERT INTO inmuebles(inmueble_uuid, usr_casero_uuid, id_inmueble)
    VALUES(
	'614d1447-8118-4a09-a774-de50838fcf91',
	'3983bb27-f996-48a5-9cff-22c14ce6421f',
	null);
