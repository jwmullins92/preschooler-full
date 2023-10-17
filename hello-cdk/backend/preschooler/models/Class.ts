import mongoose, {Schema} from "mongoose";

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

classSchema.pre(`save`, function (next) {
    if (this.teachers.length < 1) {
        return next(new Error(`A class must have at least one teacher`))
    }
    next()
})

export const ClassSchema = mongoose.model(`Class`, classSchema)