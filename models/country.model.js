import mongoose from "mongoose";

const {Schema} = mongoose;
const countrySchema = new Schema({
    country_name: { type: String, required: true },
    country_code: { type: String, required: true },
    country_phonecode: { type: String, required: true },
    phonenumber_length:{type: Number, required: true }
});

const countryModel = mongoose.model('countries', countrySchema);

export default countryModel;