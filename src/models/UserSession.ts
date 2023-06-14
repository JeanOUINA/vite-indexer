import { randomBytes } from "crypto";
import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "./User";

export enum UserSessionSource {
    API = "api",
    WEB = "web"
}

export interface IUserSession extends Document {
    user: IUser,
    source: UserSessionSource,
    token: string
}

const UserSessionSchema = new Schema<IUserSession>({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    source: {
        type: String,
        required: true,
        enum: Object.values(UserSessionSource)
    },
    token: {
        type: String,
        required: true,
        unique: true,
        default: () => {
            return randomBytes(16).toString("hex")
        }
    }
})

export default mongoose.model<IUserSession>("UserSession", UserSessionSchema);