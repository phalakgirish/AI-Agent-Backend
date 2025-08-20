
import mongoose from "mongoose";

const {Schema} = mongoose;
const conversationNoteLogsSchema = new Schema({
  conversation_note: { type: String },
  conversation_note_date: { type: Date },
  conversation_note_by: { type: mongoose.Schema.ObjectId, default:null },
  conversation_dts_id: { type: mongoose.Schema.ObjectId },
},{ timestamps: true });

const conversationNoteLogsModel = mongoose.model('conversation_note_log', conversationNoteLogsSchema);

export default conversationNoteLogsModel;
    