import * as dotenv from 'dotenv';
import path = require('path');

dotenv.config({ path: path.resolve(__dirname, `../.env`) });

export type ConfigProps = {
	REGION: string
	LAMBDA_ENV: string
	TABLE_NAME: string
	AWS_ACCESS_KEY: string
	AWS_SECRET_KEY: string
};
export const getConfig = (): ConfigProps => ({
	REGION: process.env.REGION || `us-east-1`,
	LAMBDA_ENV: process.env.LAMBDA_ENV || ``,
	TABLE_NAME: process.env.TABLE_NAME || ``,
	AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY || ``,
	AWS_SECRET_KEY: process.env.AWS_SECRET_KEY || ``
});