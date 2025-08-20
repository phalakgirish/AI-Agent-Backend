
import mongoose from "mongoose";

const {Schema} = mongoose;
const conversationDetailsSchema = new Schema({
  call_uuid: { type: String },
  conversation_id: { type: String },
  conversation_url: { type: String },
  recording_duration:{ type: String },
  recording_start_time:{ type: Date},
  recording_end_time:{ type: Date },
  recording_url: { type: String, default: '' },
  transcription: { type: String },
  event_name: { type: String },
  flow_name: { type: String },
  flow_run_uuid: { type: String, default: '' },
  flow_uuid: { type: String, default: '' },
  node_name:{ type: String, default: '' },
  conversion_Dts_date:{ type: Date },
  from_number:{ type: String, default:''},
  to_number:{ type: String, default:''},
  initiation_time:{ type: Date, default:null},
  answer_time:{ type: Date, default:null},
  end_time:{ type: Date, default:null},
  call_direction:{ type: String, default:null},
  call_duration:{ type: Number, default:0},
  call_state:{ type: String, default:null},
  call_leades:{ type: String,default:''},
  client_id:{ type: mongoose.Schema.ObjectId, required: true },
  call_lead:{ type: Boolean}
},{ timestamps: true });

const conversationDetailsModel = mongoose.model('conversation_details', conversationDetailsSchema);

export default conversationDetailsModel;
    