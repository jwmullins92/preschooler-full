import { APIGatewayProxyCallback, APIGatewayProxyEvent, Context } from 'aws-lambda';

import { HTTPOptions } from '../../lib/types/types';
import { endpointHandlers } from './helpers/endpoints';

export const handler = async (event: APIGatewayProxyEvent, context: Context, callback: APIGatewayProxyCallback) => {

	console.log(`EVENT \n${JSON.stringify(event)}`);
	let responseBody;
	const { body, resource, httpMethod } = event;

	responseBody = await endpointHandlers[resource]![httpMethod as HTTPOptions]!(event);

	const response = {
		statusCode: 200,
		headers: {
			'x-custom-header': `my custom header value`,
			'Access-Control-Allow-Origin': `*`
		},
		body: JSON.stringify(responseBody)
	};

	console.log(`response: ${JSON.stringify(response)}`);
	return response;
};