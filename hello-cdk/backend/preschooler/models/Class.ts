import mongoose, {Schema} from "mongoose";

export type MongoClass = {
    _id: string
    archived: boolean
    name: string
    students: mongoose.Types.ObjectId[]
    teachers: mongoose.Types.ObjectId[]
}

const classSchema = new Schema({
    schoolYear: {
        required: true,
        type: String
    },
    archived: {
        type: Boolean
    },
    name: {
        required: true,
        type: String
    },
    students: [{
        type: Schema.Types.ObjectId,
        ref: `Student`
    }],
    teachers: [{
        type: Schema.Types.ObjectId,
        ref: `User`,
        required: true
    }]
}, { strict: false })

classSchema.index({name: 1, schoolYear: 1}, { unique: true })

classSchema.pre(`save`, function (next) {
    if (this.teachers.length < 1) {
        return next(new Error(`A class must have at least one teacher`))
    }
    next()
})

export const ClassSchema = mongoose.model<MongoClass>(`Class`, classSchema)