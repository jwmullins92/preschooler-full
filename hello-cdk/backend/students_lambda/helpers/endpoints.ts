import { APIGatewayProxyEvent } from 'aws-lambda';
import * as dotenv from 'dotenv';
import * as pg from 'pg';

import { EndpointHandler, Parent, Student } from '../../../lib/types/types';

dotenv.config();
const pool = new pg.Pool({
	connectionString: process.env.DB_URL
});

export const endpointHandlers: EndpointHandler = {
	'/students': {
		async GET () {
			const students = (await query(`SELECT * FROM preschooler.students`)).rows as Student[];
			return Promise.all(
				students.map(async student => ({
					...student,
					parents: await query(
						`
							SELECT p.* FROM preschooler.parents as p 
							JOIN preschooler.students_to_parents as stp ON p.id = stp.parent_id
							JOIN preschooler.students as s ON s.id = stp.student_id
							WHERE s.id = $1
						`,
						[student.id]
					)
				}))
			);
		},
		async POST (event: APIGatewayProxyEvent) {
			try {
				if (!event.body) throw new Error(`No request body`);

				const { first_name, last_name, birth_date, parent_id } = JSON.parse(event.body) as Student & { parent_id: number };
				console.log(birth_date.valueOf());
				const student = (await query(
					`
						INSERT INTO preschooler.students (first_name, last_name, birth_date)
						VALUES ($1, $2, $3)
						RETURNING *
					`,
					[first_name, last_name, birth_date as number | string]
				)).rows[0] as Student;

				const studentParentEntry = await query(
					`
						INSERT INTO preschooler.students_to_parents (student_id, parent_id)
						VALUES ($1, $2)
						RETURNING *
					`,
					[student.id, parent_id]
				);
				return {
					student,
					parentRelationship: studentParentEntry
				};
			}
			catch (error) {
				return error as Record<string, unknown>;
			}
		}
	},
	'/students/{id}': {
		async GET (event: APIGatewayProxyEvent) {
			const studentId = event.pathParameters!.id!;
			try {
				const student = (await query(
					`
						SELECT * FROM preschooler.students WHERE id = $1
					`,
					[studentId]
				)).rows[0] as Student;
				const parents = (await query(
					`
						SELECT p.* FROM preschooler.parents as p 
						JOIN preschooler.students_to_parents as stp ON p.id = stp.parent_id
						JOIN preschooler.students as s ON s.id = stp.student_id
						WHERE s.id = $1
					`,
					[studentId]
				)).rows as Parent[];
				return {
					...student,
					parents
				};
			}
			catch (e: any) {
				return e;
			}
		},
		async PUT (event: APIGatewayProxyEvent) {
			try {
				if (!event.body) throw new Error(`No request body`);

				const studentId = event.pathParameters!.id!;
				const { first_name, last_name, birth_date } = JSON.parse(event.body) as Student;
				console.log(birth_date.valueOf());
				return (await query(
					`
						UPDATE preschooler.students 
						SET first_name = $1, last_name = $2, birth_date = $3
						WHERE id = $4
						RETURNING *
					`,
					[first_name, last_name, birth_date as number | string, studentId]
				)).rows[0] as Student;
			}
			catch (error) {
				return error as Record<string, unknown>;
			}
		},
		DELETE (event: APIGatewayProxyEvent) {
			try {
				const { id } = event.pathParameters!;
				return query(
					`
						DELETE FROM preschooler.students
						WHERE id = $1
					`,
					[id!]
				);
			}
			catch (e: any) {
				return e;
			}
		}
	},
	'/students/{id}/updateParents': {
		async POST (event: APIGatewayProxyEvent) {
			try {
				if (!event.body) throw new Error(`No request body`);

				const studentId = event.pathParameters!.id!;
				const { parent_id } = JSON.parse(event.body) as { parent_id: number };
				return (await query(
					`
						INSERT INTO preschooler.students_to_parents (student_id, parent_id) 
						VALUES ($1, $2)
						RETURNING *
					`,
					[studentId, parent_id]
				)).rows[0];
			}
			catch (e) {
				return e;
			}
		},
		async DELETE (event: APIGatewayProxyEvent) {
			try {
				if (!event.body) throw new Error(`No request body`);

				const studentId = event.pathParameters!.id!;
				const { parent_id } = JSON.parse(event.body) as { parent_id: number };
				return (await query(
					`
						DELETE FROM preschooler.students_to_parents
						WHERE student_id = $1 AND parent_id = $2
						RETURNING *
					`,
					[studentId, parent_id]
				)).rows[0];
			}
			catch (e) {
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