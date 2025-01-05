// models/MesasModel.js
const mongoose = require('mongoose');

const MesasSchema = new mongoose.Schema({
    numero: {
        type: Number,
        required: true,
    },
    salon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Salones',
        required: true,
    },
    active:{
        type:Boolean,
        required:true,
        default:true,
    }
}, {
    timestamps: true
});

MesasSchema.methods.toggleActive = function() {
    this.active = !this.active;
    return this.save();
};

module.exports = mongoose.model('Mesas', MesasSchema);