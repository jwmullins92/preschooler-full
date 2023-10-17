import * as express from "express"
import * as serverless from "serverless-http"
import * as bodyParser from "body-parser"
import * as mongoose from "mongoose"
import * as dotenv from "dotenv"
import {UserSchema} from "./models/User";
import {StudentSchema} from "./models/Student";
import {ClassSchema} from "./models/Class";

dotenv.config()

const isLocal = process.env.ENVIRONMENT == `local`

const app = express()
app.use(bodyParser.json({strict: false}))
mongoose.connect(process.env.MONGO_URL!)
    .then(() => console.log(`DB connected`))
    .catch((err) => console.error(`Could not connect`, err))

app.get(`/users`, async (req, res) => {
    const { role } = req.query
    try {
        const users = await UserSchema.find().populate(`students`)
        res.json(users)
    } catch (error) {
        console.error(`Could not get users`, error)
        res.json(error)
    }
})

app.get(`/user/:id`, async (req, res) => {
    try {
        const user = await UserSchema.findById(req.params.id).populate(`students`)
        res.json(user)
    } catch (err) {
        console.error(`Could not get user`, err)
        res.json(err)
    }
})

app.post('/parent', async (req, res) => {
    try {
        const parent = new UserSchema({...req.body, roles: [`parent`]});
        res.json(await parent.save())
    } catch (error) {
        console.log(`Could not create parent`, error)
        res.json(error)
    }
})

app.put('/parent/:id', async (req, res) => {
    try {
        const parent = await UserSchema.findByIdAndUpdate(req.params.id, req.body, {new: true})
        res.json(parent)
    } catch (err) {
        console.log(err)
        res.json(err)
    }
})

app.delete(`/parent/:id`, async (req, res) => {
    try {
        const deletedParent = await UserSchema.findByIdAndDelete(req.params.id)
        res.json(deletedParent)
    } catch (err) {
        console.log(err)
        res.json(err)
    }
})

app.post('/teacher', async (req, res) => {
    try {
        const teacher = new UserSchema({...req.body, roles: [`teacher`]});
        res.json(await teacher.save())
    } catch (error) {
        console.log(`Could not create parent`, error)
        res.json(error)
    }
})

app.post('/administrator', async (req, res) => {
    try {
        const administrator = new UserSchema({...req.body, roles: [`admin`]});
        res.json(await administrator.save())
    } catch (error) {
        console.log(`Could not create parent`, error)
        res.json(error)
    }
})

app.get(`/students`, async (req, res) => {
    try {
        res.json(await StudentSchema.find())
    } catch (err) {
        console.error(`Could not get students`, err)
        res.json(err)
    }
})

app.get(`/student/:id`, async (req, res) => {
    try {
        res.json(await StudentSchema.findById(req.params.id))
    } catch (err) {
        console.error(`Could not get student`, err)
        res.json(err)
    }
})
app.post(`/student`, async (req, res) => {
    const session = await mongoose.startSession()
    try {
        await session.withTransaction(async () => {
            const newStudent = await new StudentSchema(req.body.student).save({session});
            const updatedUser = await UserSchema.findByIdAndUpdate(req.body.parentId, { $push: { students: newStudent._id } }, { new: true, session }).populate(`students`)
            res.json({
                newStudent,
                updatedUser
            })
        })
        await session.endSession()
    } catch (err) {
        console.error(`Could not create student`, err)
        res.json(err)
    }
})


app.get(`/classes`, async (req, res) => {
    try {
        const classes = await ClassSchema.find().populate(`students`).populate(`teachers`)
        res.json(classes)
    } catch (err) {
        console.log(`Could not get classes`)
        res.json(err)
    }
})

app.get(`/class/:id`, async (req, res) => {
    try {
        const foundClass = await ClassSchema.findById(req.params.id).populate(`students`).populate(`teachers`)
        res.json(foundClass)
    } catch (err) {
        console.log(`Could not get class`, err)
        res.json(err)
    }
})

app.post(`/class`, async (req, res) => {
    try {
        const newClass = await new ClassSchema(req.body).save()
        console.log('here')
        res.json(newClass)
    } catch (err) {
        console.log(`Could not create class`, err)
        res.json({
            Error: err.message
        })
    }
})

if (isLocal) {
    app.listen(3000, () => {
        console.log(`Listening on 3000`)
    })
}

export const handler = serverless(app)