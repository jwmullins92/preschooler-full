import { APIGatewayProxyEvent } from 'aws-lambda';
import * as dotenv from 'dotenv';
import * as pg from 'pg';

import { EndpointHandler, Parent, Student } from '../../../lib/types/types';

dotenv.config();
const pool = new pg.Pool({
	connectionString: process.env.DB_URL
});

export const endpointHandlers: EndpointHandler = {
	'/parents': {
		async GET () {
			const parents = (await query(`
				SELECT * FROM preschooler.parents
			`)).rows as Parent[];
			return Promise.all(parents.map(async parent => ({
				...parent,
				students: (await query(
					`
						SELECT s.* FROM preschooler.students AS s
						JOIN preschooler.students_to_parents AS stp ON s.id = stp.student_id
						JOIN preschooler.parents AS p on p.id = stp.parent_id
						WHERE p.id = $1
					`,
					[parent.id]
				)).rows as Student[]
			})));
		},
		async POST (event: APIGatewayProxyEvent) {
			try {
				if (!event.body) throw new Error(`No request body`);

				const { email, first_name, last_name, phone_number, address } = JSON.parse(event.body) as Parent;
				return (await query(
					`
						INSERT INTO preschooler.parents (email, first_name, last_name, phone_number, address) 
						VALUES ($1, $2, $3, $4, $5)
						RETURNING *
					`,
					[email, first_name, last_name, phone_number, address]
				)).rows[0] as Parent;
			}
			catch (e: any) {
				return e;
			}
		}
	},
	'/parents/{id}': {
		async GET (event: APIGatewayProxyEvent) {
			const { id } = event.pathParameters!;
			try {
				const parent = (await query(
					`
						SELECT * from preschooler.parents WHERE id = $1
					`,
					[id!]
				)).rows[0] as Parent;
				const students = (await query(
					`
						SELECT s.* FROM preschooler.students AS s
						JOIN preschooler.students_to_parents AS stp ON s.id = stp.student_id
						JOIN preschooler.parents AS p on p.id = stp.parent_id
						WHERE p.id = $1
					`,
					[id!]
				)).rows;
				if (parent)
					return {
						...parent,
						students
					};

				throw new Error(`Parent not found`);

			}
			catch (error: any) {
				return {
					error,
					message: error.message
				};
			}
		},
		async PUT (event: APIGatewayProxyEvent) {
			const { id } = event.pathParameters!;
			try {
				if (!event.body) throw new Error(`No event body`);

				const { email, first_name, last_name, phone_number, address } = JSON.parse(event.body) as Parent;
				return (await query(
					`
						UPDATE preschooler.parents
						SET email = $1, first_name = $2, last_name = $3, phone_number = $4, address = $5
						WHERE id = $6
						RETURNING *
					`,
					[email, first_name, last_name, phone_number, address, id!]
				)).rows[0] as Parent;
			}
			catch (e: any) {
				return e;
			}
		},
		DELETE: async (event: APIGatewayProxyEvent) => {
			const { id } = event.pathParameters!;
			try {
				return await query(
					`
						DELETE FROM preschooler.parents
						WHERE id = $1
					`,
					[id!]
				);
			}
			catch (e: any) {
				return e;
			}
		}
	}
};

const query = async (sql: string, values: (number | string)[] = []) => {
	const db = await pool.connect();
	const response = await db.query(sql, values);
	db.release();
	return response;
};