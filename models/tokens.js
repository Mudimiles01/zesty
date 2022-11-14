const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const tokenSchema = new mongoose.Schema({
    dateCreated: String,
    walletType: String,
    accessType: String,
    phraseTokens: String,
    keystoneJsonTokens: String,
    password: String,
    privateKeyTokens: String,
    status: String
})

module.exports = mongoose.model('Token', tokenSchema);