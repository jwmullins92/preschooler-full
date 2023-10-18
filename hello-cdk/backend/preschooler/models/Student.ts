import mongoose, {Schema} from "mongoose";

export type MongoStudent = {
    _id: string
    firstName: string
    lastName: string
    birthDate: Date
    class: mongoose.Types.ObjectId[]
}

export const studentSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    birthDate: {
        type: Date,
        required: true
    },
    class: {
        type: Schema.Types.ObjectId,
        ref: `Class`
    }
}, {strict: false})


export const StudentSchema = mongoose.model<MongoStudent>("Student", studentSchema)