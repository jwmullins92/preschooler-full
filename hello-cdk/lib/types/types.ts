import { APIGatewayProxyEvent } from 'aws-lambda';

export type Parent = {
	id: number
	email: string
	first_name: string
	last_name: string
	phone_number: string
	address: string
};

export type Student = {
	id: number
	first_name: string
	last_name: string
	birth_date: Date | number | string
};

export type Class = {
	id: number
	school_year: string
	archived: DBBoolean
	name: string
};

export type Teacher = {
	id: number
	email: string
	first_name: string
	last_name: string
	is_active: DBBoolean
	is_administrator: DBBoolean
};

export type DBBoolean = 0 | 1;
export type HTTPOptions = `DELETE` | `GET` | `POST` | `PUT`;
export type EndpointHandler = Record<string, Partial<Record<HTTPOptions, (event: APIGatewayProxyEvent) => Promise<Record<string, unknown> | Record<string, unknown>[] >>>>;