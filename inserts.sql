SET SESSION SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

--users
INSERT INTO usuarios(id_usuario, user_uuid, username, password, email, tipo)
    VALUES(0,'cc77e9e5-4677-4ab6-ace9-902ef8e2e07d','admin','admin1234','asdf@asdf.asdf','ADMIN');
INSERT INTO usuarios(id_usuario, user_uuid, username, password, email, tipo)
    VALUES(null,'fd0f280d-12f4-4561-96b8-8a9850612517','pepe','1234','asdf1@asdf.asdf','INQUILINO');
INSERT INTO usuarios(id_usuario, user_uuid, username, password, email, tipo)
    VALUES(null,'d0f3bb42-fa87-4e3a-89d3-eb608eebc26b','hermeregildo','1234','asdf2@asdf.asdf','CASERO');
INSERT INTO usuarios(id_usuario, user_uuid, username, password, email, tipo)
    VALUES(null,'3983bb27-f996-48a5-9cff-22c14ce6421f','caracaca','1234','asdf3@asdf.asdf','INQUILINO_CASERO');

SELECT * FROM USUARIOS;

--admin pisos
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

--inquilino pisos
-- INSERT INTO inmuebles(inmueble_uuid, usr_casero_uuid, id_inmueble)
--     VALUES(
-- 	'af1a2bf9-ea02-4462-9731-ad387891f591',
-- 	'fd0f280d-12f4-4561-96b8-8a9850612517',
-- 	null);
-- INSERT INTO inmuebles(inmueble_uuid, usr_casero_uuid, id_inmueble)
--     VALUES(
-- 	'bb3c4fcc-d17d-4341-a4b5-30b373e78f8a',
-- 	'fd0f280d-12f4-4561-96b8-8a9850612517',
-- 	null);
-- INSERT INTO inmuebles(inmueble_uuid, usr_casero_uuid, id_inmueble)
--     VALUES(
-- 	'af593913-a5b2-4938-b14b-8073b873b5e8',
-- 	'fd0f280d-12f4-4561-96b8-8a9850612517',
-- 	null);

--casero pisos
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

--inquilino_casero pisos
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

SELECT * FROM inmuebles;