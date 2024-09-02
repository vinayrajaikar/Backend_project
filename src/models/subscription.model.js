import mongoose, {Schema} from "mongoose";

const subscriptionSchema = new Schema({
        subscriber: {
            type: Schema.Types.ObjectId, //One who suscribes
            ref: 'User',
            required: true
        },

        channel: {
            type: Schema.Types.ObjectId, //The channel(user) to which subscriber is suscribed
            ref: 'User',
            required: true
        }

    },{
        timestamps: true
        }
)

export const Subscription = mongoose.model('Subscription',subscriptionSchema)