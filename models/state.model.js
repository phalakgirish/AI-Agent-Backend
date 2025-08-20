import mongoose from "mongoose";

const {Schema} = mongoose;
const stateSchema = new Schema({
    state_name: { type: String, required: true },
    state_code: { type: String, required: true },
    state_country: { type: String, required: true },
});

const stateModel = mongoose.model('states', stateSchema);

export default stateModel;