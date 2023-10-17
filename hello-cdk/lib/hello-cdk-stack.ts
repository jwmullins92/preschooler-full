import {aws_lambda, RemovalPolicy, Stack, StackProps} from 'aws-cdk-lib';
import * as apiGateway from 'aws-cdk-lib/aws-apigateway';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dynamoDb from 'aws-cdk-lib/aws-dynamodb'
import {AttributeType, GlobalSecondaryIndexProps} from 'aws-cdk-lib/aws-dynamodb'
import {Construct} from 'constructs';

import {ConfigProps} from './config';

type AwsEnvStackProps = StackProps & {
	config: Readonly<ConfigProps>
};
export class HelloCdkStack extends Stack {
	constructor (scope: Construct, id: string, props?: AwsEnvStackProps) {
		super(scope, id, props);

		const bucket = new s3.Bucket(
			this,
			`TestBucket-jwm`,
			{
				bucketName: `test-bucket-jwm`,
				removalPolicy: RemovalPolicy.DESTROY,
				websiteIndexDocument: `index.html`,
				blockPublicAccess: {
					blockPublicAcls: false,
					blockPublicPolicy: false,
					ignorePublicAcls: false,
					restrictPublicBuckets: false
				},
				autoDeleteObjects: true
			}
		);

		const dynamoTable = new dynamoDb.Table(this, `PreschoolerTable`, {
			tableName: `preschooler`,
			partitionKey: {
				name: `pk`,
				type: AttributeType.STRING
			},
			sortKey: {
				name: `sk`,
				type: AttributeType.STRING
			},
			removalPolicy: RemovalPolicy.DESTROY
		})

		const globalSecondaryIndexes = [
			{
				indexName: `pkey`,
				partitionKey: {
					name: `pk`,
					type: AttributeType.STRING
				}
			},
			{
				indexName: `role_type`,
				partitionKey: {
					name: `role_type`,
					type: AttributeType.STRING,
				}
			},
			{
				indexName: `parents_students`,
				partitionKey: {
					name: `student_id`,
					type: AttributeType.STRING
				},
				sortKey: {
					name: `sk`,
					type: AttributeType.STRING
				}
			}
		] as GlobalSecondaryIndexProps[]

		for(const index of globalSecondaryIndexes) {
			dynamoTable.addGlobalSecondaryIndex(index)
		}

		const dynamoLambda = new aws_lambda.Function(this, `PreschoolerLambda`, {
			runtime: aws_lambda.Runtime.NODEJS_18_X,
			code: aws_lambda.Code.fromAsset('backend/preschooler'),
			handler: `index.handler`,
			environment: {
				DYNAMO_TABLE: dynamoTable.tableName,
				MONGO_URL: "mongodb+srv://jwmullins92:nqgO0XH1GIDpVZZZ@preschooler.yp4m5kw.mongodb.net/?retryWrites=true&w=majority",
				ENVIRONMENT: `web`
			}
		})

		dynamoTable.grantReadWriteData(dynamoLambda)

		// bucket.addToResourcePolicy(
		// 	new PolicyStatement({
		// 		sid: `ReactBucketStatement`,
		// 		effect: Effect.ALLOW,
		// 		resources: [`${bucket.bucketArn}/*`],
		// 		actions: [`s3:GetObject`],
		// 		principals: [new AnyPrincipal]
		// 	})
		// );
		//
		// const bucketDepoyment = new aws_s3_deployment.BucketDeployment(
		// 	this,
		// 	`PreschoolFrontend`,
		// 	{
		// 		sources: [aws_s3_deployment.Source.asset(`../client/dist`)],
		// 		destinationBucket: bucket
		// 	}
		// );
		//
		// const preschoolerUserPool = new aws_cognito.UserPool(
		// 	this,
		// 	`UserManager`,
		// 	{
		// 		mfa: Mfa.OPTIONAL,
		// 		mfaSecondFactor: {
		// 			sms: true,
		// 			otp: false
		// 		},
		// 		signInAliases: {
		// 			email: true
		// 		},
		// 		accountRecovery: AccountRecovery.EMAIL_AND_PHONE_WITHOUT_MFA,
		// 		selfSignUpEnabled: true,
		// 		email: UserPoolEmail.withCognito(),
		// 		userPoolName: `PreschoolerUsers`
		// 	}
		// );
		//
		// const domain = preschoolerUserPool.addDomain(
		// 	`PreschoolerDomainTest`,
		// 	{
		// 		cognitoDomain: {
		// 			domainPrefix: `preschooler`
		// 		}
		// 	}
		// );
		//
		// const client = preschoolerUserPool.addClient(
		// 	`PreschoolerTestClient`,
		// 	{
		// 		preventUserExistenceErrors: true,
		// 		userPoolClientName: `TestClient`,
		// 		oAuth: {
		// 			callbackUrls: [`https://google.com`]
		// 		}
		// 	}
		// );
		//
		// client.node.addDependency(preschoolerUserPool);
		//
		// const signUpUI = new CfnUserPoolUICustomizationAttachment(
		// 	this,
		// 	`userPoolUI`,
		// 	{
		// 		clientId: client.userPoolClientId,
		// 		userPoolId: preschoolerUserPool.userPoolId,
		// 		css: `
		// 			.background-customizable {
		// 			  background-color: blue;
		// 			}
		// 		`
		// 	}
		// );
		//
		// const parentsLambda = new aws_lambda.Function(
		// 	this,
		// 	`ParentHandler`,
		// 	{
		// 		code: aws_lambda.Code.fromAsset(`backend/parents_lambda`),
		// 		handler: `index.handler`,
		// 		runtime: aws_lambda.Runtime.NODEJS_18_X,
		// 		functionName: `parents-function`,
		// 		environment: {
		// 			BUCKET: bucket.bucketName
		// 		}
		// 	}
		// );
		//
		// const studentsLambda = new aws_lambda.Function(
		// 	this,
		// 	`StudentHandler`,
		// 	{
		// 		code: aws_lambda.Code.fromAsset(`backend/students_lambda`),
		// 		handler: `index.handler`,
		// 		runtime: aws_lambda.Runtime.NODEJS_18_X,
		// 		functionName: `student-function`,
		// 		environment: {
		// 			BUCKET: bucket.bucketName
		// 		}
		// 	}
		// );
		//
		// const classesLambda = new aws_lambda.Function(
		// 	this,
		// 	`ClassHandler`,
		// 	{
		// 		code: aws_lambda.Code.fromAsset(`backend/classes_lambda`),
		// 		handler: `index.handler`,
		// 		runtime: aws_lambda.Runtime.NODEJS_18_X,
		// 		functionName: `class-function`,
		// 		environment: {
		// 			BUCKET: bucket.bucketName
		// 		}
		// 	}
		// );
		//
		// const teachersLambda = new aws_lambda.Function(
		// 	this,
		// 	`TeacherHandler`,
		// 	{
		// 		code: aws_lambda.Code.fromAsset(`backend/teachers_lambda`),
		// 		handler: `index.handler`,
		// 		runtime: aws_lambda.Runtime.NODEJS_18_X,
		// 		functionName: `teacher-function`,
		// 		environment: {
		// 			BUCKET: bucket.bucketName
		// 		}
		// 	}
		// );
		//
		// bucket.grantReadWrite(parentsLambda);
		// bucket.grantReadWrite(studentsLambda);
		// bucket.grantReadWrite(classesLambda);
		// bucket.grantReadWrite(teachersLambda);

		const api = new apiGateway.RestApi(
			this,
			`TestApi`,
			{
				restApiName: `testApi`,
				defaultCorsPreflightOptions: {
					allowOrigins: [`*`]
				}
			}
		);

		// const parentIntegration = new apiGateway.LambdaIntegration(
		// 	parentsLambda,
		// 	{
		// 		requestTemplates: { 'application/json': `{ "statusCode: "200" }` }
		// 	}
		// );
		//
		// const studentIntegration = new apiGateway.LambdaIntegration(
		// 	studentsLambda,
		// 	{
		// 		requestTemplates: { 'application/json': `{ "statusCode: "200" }` }
		// 	}
		// );
		//
		// const classIntegration = new apiGateway.LambdaIntegration(
		// 	classesLambda,
		// 	{
		// 		requestTemplates: { 'application/json': `{ "statusCode: "200" }` }
		// 	}
		// );
		//
		// const teacherIntegration = new apiGateway.LambdaIntegration(
		// 	teachersLambda,
		// 	{
		// 		requestTemplates: { 'application/json': `{ "statusCode: "200" }` }
		// 	}
		// );

		const generalIntegration = new apiGateway.LambdaIntegration(
			dynamoLambda,
			{
				requestTemplates: { 'application/json': `{ "statusCode: "200" }` }
			}
		)

		const basePath = api.root.addResource(`test`)
		basePath.addMethod('ANY', generalIntegration)
		const path = api.root.addResource(`{proxy+}`)
		path.addMethod(`ANY`, generalIntegration)


		// const studentPath = api.root.addResource('students');
		// studentPath.addMethod(`GET`, generalIntegration)
		//
		// const parentPath = api.root.addResource(`parents`);
		// parentPath.addMethod('GET', generalIntegration)
		//
		// const idPath = api.root.addResource(`{id}`)
		// idPath.addMethod(`GET`, generalIntegration)

		// const parentPath = api.root.addResource(`parents`);
		// parentPath.addMethod(`GET`, parentIntegration);
		// parentPath.addMethod(`POST`, parentIntegration);
		//
		// const parentPathWithId = parentPath.addResource(`{id}`);
		// parentPathWithId.addMethod(`GET`, parentIntegration);
		// parentPathWithId.addMethod(`PUT`, parentIntegration);
		// parentPathWithId.addMethod(`DELETE`, parentIntegration);
		//
		// const studentPath = api.root.addResource(`students`);
		// studentPath.addMethod(`GET`, studentIntegration);
		// studentPath.addMethod(`POST`, studentIntegration);
		//
		// const studentPathWithId = studentPath.addResource(`{id}`);
		// studentPathWithId.addMethod(`GET`, studentIntegration);
		// studentPathWithId.addMethod(`PUT`, studentIntegration);
		// studentPathWithId.addMethod(`DELETE`, studentIntegration);
		//
		// const studentPathUpdateParents = studentPathWithId.addResource(`updateParents`);
		// studentPathUpdateParents.addMethod(`POST`, studentIntegration);
		// studentPathUpdateParents.addMethod(`DELETE`, studentIntegration);
		//
		// const classPath = api.root.addResource(`classes`);
		// classPath.addMethod(`GET`, classIntegration);
		// classPath.addMethod(`POST`, classIntegration);
		//
		// const classPathWithId = classPath.addResource(`{id}`);
		// classPathWithId.addMethod(`GET`, classIntegration);
		// classPathWithId.addMethod(`PUT`, classIntegration);
		// classPathWithId.addMethod(`DELETE`, classIntegration);
		//
		// const classPathRoster = classPathWithId.addResource(`updateRoster`);
		// classPathRoster.addMethod(`POST`, classIntegration);
		// classPathRoster.addMethod(`DELETE`, classIntegration);
		//
		// const classPathTeachers = classPathWithId.addResource(`updateTeachers`);
		// classPathTeachers.addMethod(`POST`, classIntegration);
		// classPathTeachers.addMethod(`DELETE`, classIntegration);
		//
		// const teacherPath = api.root.addResource(`teachers`);
		// teacherPath.addMethod(`GET`, teacherIntegration);
		// teacherPath.addMethod(`POST`, teacherIntegration);
		//
		// const teacherPathWithId = teacherPath.addResource(`{id}`);
		// teacherPathWithId.addMethod(`GET`, teacherIntegration);
		// teacherPathWithId.addMethod(`PUT`, teacherIntegration);
		// teacherPathWithId.addMethod(`DELETE`, teacherIntegration);
	}
}