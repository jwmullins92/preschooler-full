import mongoose, {Schema} from "mongoose";
import {StudentSchema} from "./Student";
import {StudentWithId, UserWithId} from "../../../lib/types/types";

export type MongoUser = {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    address: string;
    roles: (`parent` | `teacher` | `admin`)[];
    students: mongoose.Types.ObjectId[];
};

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
    const { students } = await UserSchema.findById(this.getFilter()).select(`students`) as UserWithId & {students: StudentWithId[]}
    console.log(students)
    await StudentSchema.deleteMany({ _id: { $in: students }})
})

export const UserSchema = mongoose.model<MongoUser>('User', userSchema)