import {DynamoDB} from "aws-sdk";
import * as dotenv from "dotenv"
import * as path from "path";
import {Credentials} from "aws-lambda";
import {randomUUID} from "crypto";
dotenv.config({
    path: path.resolve(__dirname, `../.env`)
})

const TableName = `preschooler`

const config = {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN,
    region: process.env.REGION
} as Credentials & { region: string }


const parents = [
    {
        pk: `USER#1`,
        sk: randomUUID(),
        role_type: `parent`,
        first_name: `Jared`,
        last_name: `Mullins`,
        phone_number: `123-456-7890`,
        address: `123 My House`
    },
    {
        pk: `USER#2`,
        sk: randomUUID(),
        role_type: `parent`,
        first_name: `Chelsea`,
        last_name: `Mullins`,
        phone_number: `321-654-0987`,
        address: `123 My House`
    },
    {
        pk: `USER#3`,
        sk: randomUUID(),
        role_type: `parent`,
        first_name: `Another`,
        last_name: `Parent`,
        phone_number: `111-456-7811`,
        address: `456 His House`
    },
    {
        pk: `USER#4`,
        sk: randomUUID(),
        role_type: `parent`,
        first_name: `Gus`,
        last_name: `Gustor`,
        phone_number: `124-945-9543`,
        address: `32 Another Place`
    }
]

const students = [
    {
        pk: `STUDENT#1`,
        sk: randomUUID(),
        role_type: `student`,
        first_name: `Obed`,
        last_name: `Mullins`,
        birth_date: `09-05-2019`
    },
    {
        pk: `STUDENT#2`,
        sk: randomUUID(),
        role_type: `student`,
        first_name: `Another`,
        last_name: `Kid`,
        birth_date: `11-29-2019`
    }
]

const relationships = () => {
    return [
        {
            pk: `PARENT#1`,
            sk: `PARENT#1#STUDENT#1`,
            student_id: `STUDENT#1`,
        },
        {
            pk: `PARENT#2`,
            sk: `PARENT#2#STUDENT#1`,
            student_id: `STUDENT#1`,
        },
        {
            pk: `PARENT#3`,
            sk: `PARENT#3#STUDENT#2`,
            student_id: `STUDENT#2`,
        }
    ]
}

console.log(relationships())
const dynamoDb = new DynamoDB.DocumentClient(config)



// dynamoDb.update({
//     TableName,
//     Key: {
//         id: `1`
//     },
//     UpdateExpression: `SET students = :students`,
//     ExpressionAttributeValues: {
//         ':students': [
//             students[0]
//         ]
//     }
// }, (err, data) => {
//     console.log(err, data)
// })

// dynamoDb.batchWrite({
//     RequestItems: {
//         [TableName]: [...parents, ...students, ...relationships()].map(Item => ({
//             PutRequest: {
//                 Item
//             }
//         }))
//     }
// }, (err, data) => {
//     if (err) {
//         console.log(err)
//     } else {
//         console.log("Items written to Table: ", data)
//     }
// })

// const p = () => {
//     let result = []
//     dynamoDb.query({
//         TableName,
//         IndexName: `parents_students`,
//         KeyConditionExpression: `student_id = :student_id`,
//         FilterExpression: `begins_with(pk, :prefix)`,
//         ExpressionAttributeValues: {
//             ':student_id': `STUDENT#1`,
//             ':prefix': `PARENT`
//         }
//     }, (err, data) => {
//         result = data.Items as []
//
//         for(let item of data.Items!) {
//             dynamoDb.query({
//                 TableName,
//                 IndexName: `pkey`,
//                 KeyConditionExpression: `pk = :pk`,
//                 ExpressionAttributeValues: {
//                     ':pk': item.pk
//                 }
//             }, (err, data) => {
//                 console.log("LOOK RES", result)
//                 console.log(item)
//                 item = {
//                     ...item,
//                     parents: data.Items
//                 }
//             })
//         }
//         })
//     console.log('RESULT: ', result)
//     return result
//     })
//
// }
//
// console.log('PPP', p())

// const test = dynamoDb.batchGet({
//     RequestItems: {
//         preschooler: {
//             Keys: [
//                 {
//                     pk: `PARENT#1`,
//                     sk: `PARENT#1#STUDENT#1`
//                 },
//                 {
//                     pk: `PARENT#2`,
//                     sk: `PARENT#2#STUDENT#1`
//                 }
//             ]
//         }
//     }
// }, (err, data) => {
//     console.log(err, data.Responses.preschooler)
// })

// dynamoDb.batchGet({
//     RequestItems: {
//         preschooler: {
//             Keys: [{
//                 pk: `1`,
//                 sk: `4af6c80c-0672-48aa-a4d8-e261a5067e6e`
//             }]
//         }
//     }
// }, (err, data) => {
//     console.log(err, data)
// })