import mongoose, { Schema } from "mongoose";

var subscriptionSchema = new Schema({
    subscription: { type: Schema.Types.ObjectId, ref: "User" },
    channel: { type: Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });
export const SubscriptionSchema = mongoose.model("SubscriptionSchema", subscriptionSchema);