import { APIGatewayProxyEvent } from 'aws-lambda';

type WithId = { _id: string }

export type User = {
	email: string
	firstName: string
	lastName: string
	phoneNumber: string
	address: string
	roles: (`parent` | `teacher` | `admin`)[]
}
export type UserWithId = User & WithId

export type Parent = User & { students: StudentWithId[] };
export type ParentWithId = Parent & WithId

export type Student = {
	firstName: string
	lastName: string
	birthDate: Date | number | string
};
export type StudentWithId = Student & WithId

export type Class = {
	schoolYear: string
	archived: boolean
	name: string
};
export type ClassWithId = Class & WithId

export type Teacher = User
export type TeacherWithId = Teacher & WithId

export type HTTPOptions = `DELETE` | `GET` | `POST` | `PUT`;
export type EndpointHandler = Record<string, Partial<Record<HTTPOptions, (event: APIGatewayProxyEvent) => Promise<Record<string, unknown> | Record<string, unknown>[] >>>>;