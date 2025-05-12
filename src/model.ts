import mongoose, {Document, Schema} from "mongoose";

export interface IUser extends Document{
    name: string
    email: string
    password: string
    role: string
    playlist: string[]
    lastLogin?: Date,
    isVerified?: boolean,
    searchHistory?:string[],
    resetPasswordToken?: String | undefined,
    resetPasswordExpiresAt?:Date,
    verificationToken?:String,
    verificationTokenExpiresAt?: Date,
}

const schema: Schema<IUser> = new Schema({
    name:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase:true
    },
    password:{
        type: String,
        required: true,
    },
    role:{
        type: String,
        default: "user",
    },
    lastLogin:{
        type: Date,
        default: Date.now()
    },
    isVerified:{
        type: Boolean,
        default: false,
    },
    playlist:[
        {
            type: String,
            required: true,
        }
    ],
    searchHistory:{
        type:[String],
        default: [],
    },
    resetPasswordToken: String,
    resetPasswordExpiresAt:Date,
    verificationToken:String,
    verificationTokenExpiresAt: Date,

}, {
    timestamps: true
}
);

export const User= mongoose.model<IUser>("User", schema);