#!/usr/bin/env node
import 'source-map-support/register';

import * as cdk from 'aws-cdk-lib';

import { getConfig } from '../lib/config';
import { HelloCdkStack } from '../lib/hello-cdk-stack';
const config = getConfig();

const app = new cdk.App;
new HelloCdkStack(
	app,
	`HelloCdkStack`,
	{
		env: {
			region: config.REGION
		},
		config
	}
);