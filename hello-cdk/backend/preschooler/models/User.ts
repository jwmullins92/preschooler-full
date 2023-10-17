import mongoose, {Schema} from "mongoose";
import {StudentSchema} from "./Student";

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    roles: {
        type: [String],
        enum: [`parent`, `teacher`, `admin`]
    },
    students: [{
        type: Schema.Types.ObjectId,
        ref: `Student`
    }]
}, {strict: false})

userSchema.pre(`deleteOne`, async function (){
    await StudentSchema.deleteMany({ _id: { $in: this.students}})
})

export const UserSchema = mongoose.model('User', userSchema)