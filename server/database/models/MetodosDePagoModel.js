// models/MetodosDePagoModel.js
const mongoose = require('mongoose');

const MetodosDePagoSchema = new mongoose.Schema({
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

MetodosDePagoSchema.methods.toggleActive = function() {
    this.active = !this.active;
    return this.save();
}

module.exports = mongoose.model('MetodosDePago', MetodosDePagoSchema);