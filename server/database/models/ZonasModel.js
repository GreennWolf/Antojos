// models/ZonasModel.js
const mongoose = require('mongoose');

const ZonasSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        unique: true,
    },
   impresora: {
        type: String,
        required: true,
    },
    cobro: {
        type:Boolean,
        required:true,
        default:false
    },
    active:{
        type:Boolean,
        required:true,
        default:true,
    }
}, {
    timestamps: true
});

ZonasSchema.methods.toggleActive = function() {
    this.active = !this.active;
    return this.save();
}

module.exports = mongoose.model('Zonas', ZonasSchema);