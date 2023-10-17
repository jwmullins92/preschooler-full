import * as dotenv from 'dotenv';
import * as pg from 'pg';
import path = require('path');

dotenv.config({ path: path.resolve(__dirname, `../.env`) });

const db = new pg.Client(process.env.DB_URL);

db.connect(async () => {
	await db.query(`
		INSERT INTO preschooler.parents (email, first_name, last_name, phone_number, address)
		VALUES ('j@gmail.com', 'Jared', 'Mullins', '123-456-7889', '123 My place'),
		('c@gmail.com', 'Chelsea', 'Mullins', '908-765-4321', '123 My place'),
		('someone@gmail.com', 'John', 'Doe', '555-555-5555', '345 Middle of nowhere')
	`);

	await db.query(`
		INSERT INTO preschooler.students (first_name, last_name, birth_date) 
		VALUES ('Obed', 'Mullins', '09-05-2019'),
		('Some', 'Kid', '10-24-2019') 
	`);

	await db.query(`
		INSERT INTO preschooler.classes (school_year, archived, name)
		VALUES ('2023-2024', 0, 'Orange'),
		('2021-2022', 1, 'Purple')
	`);
});