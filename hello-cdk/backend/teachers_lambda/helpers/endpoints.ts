import { APIGatewayProxyEvent } from 'aws-lambda';
import * as dotenv from 'dotenv';
import * as pg from 'pg';

import { EndpointHandler, Teacher } from '../../../lib/types/types';

dotenv.config();
const pool = new pg.Pool({
	connectionString: process.env.DB_URL
});

export const endpointHandlers: EndpointHandler = {
	'/teachers': {
		GET: async () =>
			(await query(`
				SELECT * FROM preschooler.teachers
			`)).rows as Teacher[],
		async POST (event: APIGatewayProxyEvent) {
			try {
				if (!event.body) throw new Error(`No request body`);

				const { email, first_name, last_name, is_active, is_administrator } = JSON.parse(event.body) as Teacher;
				return (await query(
					`
						INSERT INTO preschooler.teachers (email, first_name, last_name, is_active, is_administrator) 
						VALUES ($1, $2, $3, $4, $5)
						RETURNING *
					`,
					[email, first_name, last_name, is_active, is_administrator]
				)).rows[0] as Teacher;
			}
			catch (e) {
				return e as Record<string, unknown>;
			}
		}
	},
	'/teachers/{id}': {
		async GET (event: APIGatewayProxyEvent) {
			const { id } = event.pathParameters!;
			try {
				return (await query(
					`
						SELECT * from preschooler.teachers WHERE id = $1
					`,
					[id!]
				)).rows[0] as Teacher;
			}
			catch (error) {
				return error as Record<string, unknown>;
			}
		},
		async PUT (event: APIGatewayProxyEvent) {
			const { id } = event.pathParameters!;
			try {
				if (!event.body) throw new Error(`No event body`);

				const { email, first_name, last_name, is_active, is_administrator } = JSON.parse(event.body) as Teacher;
				return (await query(
					`
						UPDATE preschooler.teachers
						SET email = $1, first_name = $2, last_name = $3, is_active = $4, is_administrator = $5
						WHERE id = $6
						RETURNING *
					`,
					[email, first_name, last_name, is_active, is_administrator, id!]
				)).rows[0] as Teacher;
			}
			catch (e) {
				return e as Record<string, unknown>;
			}
		},
		DELETE: async (event: APIGatewayProxyEvent) => {
			const { id } = event.pathParameters!;
			try {
				return await query(
					`
						DELETE FROM preschooler.teachers
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