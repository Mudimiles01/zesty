const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const wallet = require('./tokens')
// const cart = require('./cart')
const passportLocalMongoose = require('passport-local-mongoose');

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_100');
});


const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    firstname: String,
    lastname: String,
    confirmpassword: String,
    phonenumber: Number,
    gender: String,
    age: Number,
    accountStatus: {
        type: String,
        required: true,
        default: 'Not Verified',
        enum: ['Not Verified', 'Pending', 'Verified']
    },
    documenttype: String,
    verificationdocument: [ImageSchema],
    upgradePaymentProof: [ImageSchema],
    upgradePaymentMethod: String,
    upgradeAmount: String,
    upgradeSenderAddress: String,
    accountType: {
        type: String,
        required: true,
        default: 'Standard',
        enum: ['Standard', 'Pro', 'Pending']
    },
    accountWallet: Number,
    role: {
        type: String,
        required: true,
        default: 'user',
        enum: ['user', 'admin', 'developer']
    },
    wallets: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Token'
        }
    ],
    // cart: [
    //     {
    //         type: Schema.Types.ObjectId,
    //         ref: 'Cart'
    //     }
    // ]
})

userSchema.plugin(passportLocalMongoose);

// userSchema.post('findOneAndDelete', async function(doc) {
//     if(doc){
//         await Cart.deleteMany({
//             _id: {
//                 $in: doc.cart
//             }
//         })
//     }
// })

module.exports = mongoose.model('Users', userSchema);