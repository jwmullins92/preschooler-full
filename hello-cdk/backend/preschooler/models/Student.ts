import mongoose, {Schema} from "mongoose";

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
    }
}, {strict: false})


export const StudentSchema = mongoose.model("Student", studentSchema)