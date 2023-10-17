import { APIGatewayProxyEvent } from 'aws-lambda';

import { HTTPOptions } from '../../lib/types/types';
import { endpointHandlers } from './helpers/endpoints';

export const handler = async (event: APIGatewayProxyEvent) => {
	console.log(`EVENT \n${JSON.stringify(event)}`);

	const { resource, httpMethod } = event;
	const responseBody = await endpointHandlers[resource]![httpMethod as HTTPOptions]!(event);

	return {
		statusCode: 200,
		body: JSON.stringify(responseBody)
	};
};