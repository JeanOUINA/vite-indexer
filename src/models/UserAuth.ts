import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "./User";

export interface IUserAuth extends Document {
    provider: "github",
    provider_id: string,
    user: IUser,
    active: boolean
}

const UserAuthSchema = new Schema<IUserAuth>({
    provider: {
        type: String,
        required: true,
        enum: ["github"]
    },
    provider_id: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    active: {
        type: Boolean,
        default: true
    }
})

export default mongoose.model<IUserAuth>("UserAuth", UserAuthSchema);