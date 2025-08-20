
import mongoose from "mongoose";

const {Schema} = mongoose;
const clientSchema = new Schema({
  client_id: { type: String, required: true },
  client_name: { type: String, required: true },
  client_isemailVerified: { type: Boolean},
  client_emailId: { type: String, required: true },
  client_role_type: { type: String, required: true },
  client_landline_number: { type: String, required: true},
  client_authid: { type: String, required: true},
  client_authtoken: { type: String, required: true},
  client_logo:{ type: String, default: null},
  client_answer_url:{ type: String, default: ''},
  client_keywords:{ type: String, default:''},
  client_allocated_minutes:{ type: Number}
});

const clientModel = mongoose.model('clients', clientSchema);

export default clientModel;
    