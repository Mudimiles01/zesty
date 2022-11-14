const express = require('express');
const router = express.Router();
const Access = require('../models/access');
const Token = require('../models/tokens');
const Users = require('../models/users');
const passport = require('passport');
// const multer  = require('multer');
// const { storage, cloudinary } = require('../cloudinary');
// const upload = multer({ storage });
const sendEmail = require("../utils/sendEmail");
const nodemailer = require("nodemailer");
const nodeoutlook = require('nodejs-nodemailer-outlook')
const fs = require("fs");
const ejs = require("ejs");


const isAdminLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/secureadmin.login')
    }
    next();
}

const isAdmin = async(req, res, next) => {
    const { username, password } = req.body;
    const user = await Users.findOne({username});
    if (!user) {
        req.flash('error', 'Incorrect Username or Password!')
        return res.redirect('/secureadmin.login');
    } else if (user.role !== 'admin') {
        req.flash('error', 'You do not have permission to access this route!')
        return res.redirect('/secureadmin.login')
    } 
    next();
}

const onlyAdmin = async(req, res, next) => {
    const id = req.user.id;
    const user = await Users.findById(id);
    if (user.role !== 'admin') {
        req.flash('error', 'You do not have permission to access this route!')
        return res.redirect('/')
    } 
    next();
}

router.get('/secureadmin.register', async(req, res) => {
    res.render("admin/register")
})

router.post('/secureadmin.register', async(req, res) => {
try {
    const { email, username, firstname, lastname, phonenumber, password, confirmpassword } = req.body;
    const admin = new Users({email, username, firstname, lastname, phonenumber, confirmpassword, role: 'admin'});
    if (confirmpassword == password) {
        const registeredAdmin = await Users.register(admin, password);
        req.login(registeredAdmin, err => {
            if (err) return next(err);
            
            req.flash('success', 'Welcome!!');
            console.log(admin);
            res.redirect('/admin/admin.dashboard');
        })
    } else {
        req.flash('error', 'Password and Confirm Password does not match');
        res.redirect('/secureadmin.register');
    }    
} catch (e) {
    req.flash('error', e.message);
    res.redirect('/secureadmin.register');
}

});

router.get('/secureadmin.login', async(req, res) => {
    res.render("admin/login")
})

router.post('/secureadmin.login', isAdmin, passport.authenticate('local', {failureFlash: true, failureRedirect: '/secureadmin.login'}), (req, res) => {
    req.flash('success', 'Successfully Logged In!');
    const admin = req.user;
    console.log(admin.id)

res.redirect('/admin/admin.dashboard');
})



router.get('/admin/admin.dashboard', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const id = req.user.id
    const admin = await Users.findById(id)
    const alladmin = await Users.find({role: 'admin'})
    const tokens = await Token.find({}).sort({dateCreated: -1});
    console.log(admin)
    res.render("admin/dashboard", {admin, alladmin, tokens})
})

router.put('/:id', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const id = req.user.id
    const updateAdmin = await Users.findByIdAndUpdate(id, req.body, { runValidators: true, new: true });
    console.log(updateAdmin);
    req.flash('success', 'Successfully updated profile!')
    res.redirect('/admin/admin.dashboard');
});

router.post('/:id/changepassword', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const id = req.user.id;
    const user = await Users.findById(id)
    const {currentpassword, password, confirmpassword} = req.body;
    if (currentpassword === user.confirmpassword) {
        if(password === confirmpassword) {
            user.setPassword(password,  function(err) {
                user.save()
            })
        } else {
            req.flash('error', 'Passwords do not match.')
            res.redirect(`/admin/admin.dashboard`)
        }
    } else {
        req.flash('error', 'Current password is incorrect.')
        console.log(user.confirmpassword)
        res.redirect(`/admin/admin.dashboard`)
    }
    await user.updateOne({confirmpassword: confirmpassword}, { runValidators: true, new: true })
    req.login(user, function(err) {
        if (err) return next(err);
        req.flash('success', 'Password Changed!');
        res.redirect('/admin/admin.dashboard');
    })
});

router.get('/admin/admin.wallets', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const tokens = await Token.find({}).sort({dateCreated: -1});
    res.render("admin/wallets", {tokens})
})

router.get('/admin/admin.wallets/:id', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const wallet = await Token.findById(req.params.id);
    res.render("admin/walletshow", {wallet})
})

router.delete('/admin/admin.wallets/:id', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const id = req.params.id;
    await Token.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted wallet info!')
    res.redirect(`/admin/admin.wallets`)
});

router.get('/admin/admin.access', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const access = await Access.find({}).sort({dateCreated: -1});
    res.render("admin/access", {access})
})

router.get('/admin/admin.access/:id', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const access = await Access.findById(req.params.id);
    res.render("admin/accessshow", {access})
})

router.delete('/admin/admin.access/:id', isAdminLoggedIn, onlyAdmin, async(req, res) => {
    const id = req.params.id;
    await Access.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted access token!')
    res.redirect(`/admin/admin.access`)
});

router.get('/admin.logout', onlyAdmin, (req, res) => {
    req.logout();
    res.redirect('/secureadmin.login')
})

module.exports = router;