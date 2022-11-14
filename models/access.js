const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const accessSchema = new mongoose.Schema({
    dateCreated: String,
    walletname: String,
    profile: String,
    nftstatus: String,
    email: String
})

module.exports = mongoose.model('Access', accessSchema);