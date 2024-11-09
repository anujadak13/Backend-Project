import mongoose, {Schema} from "mongoose"

const SubscriptionSchema = Schema({
    subscriber: {
        type: Schema.Types.ObjectId, // One who subscribing
        ref: "User"
    },
    channel:{
        type: Schema.Types.ObjectId, // one to whom subscriber is subscribing
        ref: "User"
    }
}, {timestamps: true})

export const Subscription = mongoose.model("Subscription", SubscriptionSchema)