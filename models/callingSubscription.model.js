
import mongoose from "mongoose";

const {Schema} = mongoose;
const callingSubscriptionSchema = new Schema({
  client_sub_id: { type: String, required: true},
  client_id: { type: mongoose.Schema.ObjectId, required: true },
  client_allocated_minutes:{ type: Number},
  client_available_minutes:{ type: Number},
  client_subscription_date:{ type: Date, default:null},
  client_subscription_remarks: { type: String, default:''}
});

const callingSubscriptionModel = mongoose.model('clients_calling_subscription', callingSubscriptionSchema);

export default callingSubscriptionModel;