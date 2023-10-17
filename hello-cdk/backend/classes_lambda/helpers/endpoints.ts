import { APIGatewayProxyEvent } from 'aws-lambda';
import * as dotenv from 'dotenv';
import * as pg from 'pg';

import { Class, EndpointHandler } from '../../../lib/types/types';

dotenv.config();
const pool = new pg.Pool({
	connectionString: process.env.DB_URL,
	max: 5,
	allowExitOnIdle: true
});

export const endpointHandlers: EndpointHandler = {
	'/classes': {
		async GET () {
			const classes = (await query(`
				SELECT * FROM preschooler.classes ORDER BY id
			`)).rows as Class[];
			return Promise.all(
				classes.map(async c => ({
					...c,
					teachers: (await query(
						`
							SELECT t.* FROM preschooler.teachers as t
							JOIN preschooler.teachers_to_classes as ttc ON t.id = ttc.teacher_id
							JOIN preschooler.classes as c ON c.id = ttc.class_id
							WHERE c.id = $1
						`,
						[c.id]
					)).rows,
					students: (await query(
						`
							SELECT s.* FROM preschooler.students as s
							JOIN preschooler.students_to_classes as stc ON s.id = stc.student_id
							JOIN preschooler.classes as c ON c.id = stc.class_id
							WHERE c.id = $1
						`,
						[c.id]
					)).rows
				}))
			);
		},
		async POST (event: APIGatewayProxyEvent) {
			try {
				if (!event.body) throw new Error(`No request body`);

				const { school_year, name, archived, teacher_id } = JSON.parse(event.body) as Class & { teacher_id?: number };
				const newClass = (await query(
					`
						INSERT INTO preschooler.classes (school_year, name, archived) 
						VALUES ($1, $2, $3)
						RETURNING *
					`,
					[school_year, name, archived]
				)).rows[0] as Class;
				if (teacher_id) {
					const classTeacherEntry = await query(
						`
							INSERT INTO preschooler.teachers_to_classes (teacher_id, class_id)
							VALUES ($1, $2)
							RETURNING *
						`,
						[teacher_id, newClass.id]
					);
					return {
						class: newClass,
						classTeacherRelationship: classTeacherEntry
					};
				}
				return {
					class: newClass
				};
			}
			catch (e) {
				console.log(e);
				return e as Record<string, unknown>;
			}
		}
	},
	'/classes/{id}': {
		async GET (event: APIGatewayProxyEvent) {
			const { id } = event.pathParameters!;
			try {
				const [classInfo, students, teachers] = await Promise.all([
					query(
						`
							SELECT *
							FROM preschooler.classes
							WHERE id = $1
						`,
						[id!]
					),
					query(
						`
							SELECT s.* FROM preschooler.students as s
							JOIN preschooler.students_to_classes as stc ON s.id = stc.student_id
							JOIN preschooler.classes as c ON c.id = stc.class_id
							WHERE c.id = $1
						`,
						[id!]
					),
					query(
						`
							SELECT t.* from preschooler.teachers as t 
							JOIN preschooler.teachers_to_classes as ttc ON t.id = ttc.teacher_id
							JOIN preschooler.classes as c ON c.id = ttc.class_id
							WHERE c.id = $1
						`,
						[id!]
					)
				]);
				return {
					...classInfo.rows[0],
					students: students.rows,
					teachers: teachers.rows
				};
			}
			catch (error: any) {
				return error;
			}
		},
		async PUT (event: APIGatewayProxyEvent) {
			const { id } = event.pathParameters!;
			try {
				if (!event.body) throw new Error(`No event body`);

				const { school_year, name, archived, teacher_id } = JSON.parse(event.body) as Class & { teacher_id?: number };
				const updatedClass = (await query(
					`
						UPDATE preschooler.classes
						SET school_year = $1, archived = $2, name = $3
						WHERE id = $4
						RETURNING *
					`,
					[school_year, `${archived}`, name, id!]
				)).rows[0] as Class;
				if (teacher_id) {
					const classTeacherEntry = await query(
						`
							INSERT INTO preschooler.teachers_to_classes (teacher_id, class_id)
							VALUES ($1, $2)
						`,
						[teacher_id, updatedClass.id]
					);
					return {
						class: updatedClass,
						classTeacherRelationship: classTeacherEntry
					};
				}
				return {
					class: updatedClass
				};
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
						DELETE FROM preschooler.classes
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
	'/classes/{id}/updateRoster': {
		async POST (event: APIGatewayProxyEvent) {
			const { id: classId } = event.pathParameters!;
			try {
				if (!event.body?.length) throw new Error(`No event body`);

				const studentIds = JSON.parse(event.body) as number[];
				return await Promise.all(
					studentIds.map(studentId =>
						query(
							`
								INSERT INTO preschooler.students_to_classes (student_id, class_id)
								VALUES ($1, $2)
							`,
							[studentId, +classId!]
						))
				);
			}
			catch (e: any) {
				return e;
			}
		},
		DELETE: async (event: APIGatewayProxyEvent) => {
			try {
				if (!event.body) throw new Error(`No request body`);

				const classId = event.pathParameters!.id!;
				const studentIds = JSON.parse(event.body) as number[];
				return await Promise.all(
					studentIds.map(studentId =>
						query(
							`
								DELETE FROM preschooler.students_to_classes
								WHERE student_id = $1 AND class_id = $2
								RETURNING *
							`,
							[studentId, classId]
						))
				);
			}
			catch (e: any) {
				return e;
			}
		}
	},
	'/classes/{id}/updateTeachers': {
		async POST (event: APIGatewayProxyEvent) {
			const { id: classId } = event.pathParameters!;
			try {
				if (!event.body?.length) throw new Error(`No event body`);

				const teacherIds = JSON.parse(event.body) as number[];
				return await Promise.all(
					teacherIds.map(teacherId =>
						query(
							`
								INSERT INTO preschooler.teachers_to_classes (teacher_id, class_id)
								VALUES ($1, $2)
							`,
							[teacherId, +classId!]
						))
				);
			}
			catch (e: any) {
				return e;
			}
		},
		DELETE: async (event: APIGatewayProxyEvent) => {
			try {
				if (!event.body) throw new Error(`No request body`);

				const classId = event.pathParameters!.id!;
				const teacherIds = JSON.parse(event.body) as number[];
				return await Promise.all(
					teacherIds.map(teacherId =>
						query(
							`
								DELETE FROM preschooler.students_to_classes
								WHERE student_id = $1 AND class_id = $2
								RETURNING *
							`,
							[teacherId, classId]
						))
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
	await db.release();
	return response;
};