// models/SalonModel.js
const mongoose = require('mongoose');

const SalonesSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        unique: true,
    },
    active:{
        type:Boolean,
        required:true,
        default:true,
    }
}, {
    timestamps: true
});

SalonesSchema.methods.toggleActive = function() {
    this.active = !this.active;
    return this.save();
}

module.exports = mongoose.model('Salones', SalonesSchema);