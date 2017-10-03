const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const phoneSchema = new Schema ({
    name: {
            type: String,
            required: [true, 'What is the phone\'s name?']
          },
    brand: {
            type:String,
            required: [true, 'Brand is required']
          },
    image: {
            type: String,
            required: [true, 'Please provide an image URL']
          },
    specs: [String],
    phoner:{type:Schema.Types.ObjectId, ref:'User', required:true}
});

const PhoneModel = mongoose.model('Phone', phoneSchema);


module.exports = PhoneModel;
