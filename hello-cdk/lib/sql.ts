import * as dotenv from 'dotenv';
import * as pg from 'pg';
import path = require('path');

dotenv.config({ path: path.resolve(__dirname, `../.env`) });

const db = new pg.Client(process.env.DB_URL);
const tables = [
	{
		name: `parents`,
		sql: `
			CREATE TABLE IF NOT EXISTS preschooler.parents (
			    id SERIAL PRIMARY KEY,
			 	email VARCHAR NOT NULL UNIQUE,
			    first_name VARCHAR NOT NULL,
			    last_name VARCHAR NOT NULL,
			    phone_number VARCHAR NOT NULL,
			    address VARCHAR NOT NULL 
			)
		`,
		constraint: true
	},
	{
		name: `teachers`,
		sql: `
			CREATE TABLE IF NOT EXISTS preschooler.teachers (
			    id SERIAL PRIMARY KEY,
			    email VARCHAR NOT NULL UNIQUE,
			    first_name VARCHAR NOT NULL,
			    last_name VARCHAR NOT NULL,
			    is_active INT NOT NULL,
			    is_administrator INT
			)
		`
	},
	{
		name: `teachers_to_classes`,
		sql: `
			CREATE TABLE IF NOT EXISTS preschooler.teachers_to_classes (
			    id SERIAL UNIQUE,
			    teacher_id int REFERENCES preschooler.teachers(id),
			    class_id int REFERENCES preschooler.classes(id),
			    PRIMARY KEY (teacher_id, class_id)                                     
			)
		`,
		constraint: true
	},
	{
		name: `students`,
		sql: `
			CREATE TABLE IF NOT EXISTS preschooler.students (
			    id SERIAL PRIMARY KEY,
			    first_name VARCHAR NOT NULL,
			    last_name VARCHAR NOT NULL,
			    birth_date DATE NOT NULL
			)
		`
	},
	{
		name: `students_to_classes`,
		sql: `
			CREATE TABLE IF NOT EXISTS preschooler.students_to_classes (
			    id SERIAL UNIQUE,
			    student_id int REFERENCES preschooler.students(id),
			    class_id int REFERENCES preschooler.classes(id), 
			             PRIMARY KEY (student_id, class_id)
			)
		`,
		constraint: true
	},
	{
		name: `students_to_parents`,
		sql: `
			CREATE TABLE IF NOT EXISTS preschooler.students_to_parents (
			    id SERIAL UNIQUE,
			    student_id int REFERENCES preschooler.students(id),
			    parent_id int REFERENCES preschooler.parents(id),
			    PRIMARY KEY (student_id, parent_id)                                  
			)
		`,
		constraint: true
	},
	{
		name: `classes`,
		sql: `
			CREATE TABLE IF NOT EXISTS preschooler.classes (
			    id SERIAL PRIMARY KEY,
			    school_year VARCHAR NOT NULL,
			    archived INT,
			    name VARCHAR NOT NULL
			)
		`
	},
	{
		name: `emergency_contacts`,
		sql: `
			CREATE TABLE if not exists preschooler.emergency_contacts (
			    id SERIAL PRIMARY KEY,
			    first_name VARCHAR NOT NULL,
			    last_name VARCHAR NOT NULL,
			    address VARCHAR NOT NULL,
			    phone_number INT NOT NULL
			)
		`
	},
	{
		name: `emergency_contacts_to_students`,
		sql: `
			CREATE TABLE IF NOT EXISTS preschooler.emergency_contacts_to_students (
			    id SERIAL UNIQUE,
			    emergency_contact_id INT NOT NULL REFERENCES preschooler.emergency_contacts(id),
			    student_id INT NOT NULL REFERENCES preschooler.students(id),
			    PRIMARY KEY (emergency_contact_id, student_id)
			)
		`,
		constraint: true
	}
];

const drop = true;

db.connect(async err => {
	if (err) console.log(`could not connect`, err);

	if (drop) {
		const tableNames = tables.map(({ name }) => `preschooler.${name}`);
		await db.query(`
			DROP TABLE IF EXISTS ${tableNames.join(`, `)} CASCADE
		`);
	}
	await Promise.all(tables.map(({
		sql,
		constraint
	}) => {
		if (!constraint) void db.query(sql);
	}));

	await Promise.all(tables.map(({
		sql,
		constraint
	}) => {
		if (constraint) void db.query(sql);

	}));
});