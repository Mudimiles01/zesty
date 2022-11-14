if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const ejsMate = require('ejs-mate');
const webRoutes = require('./routes/web-routes');
const adminRoutes = require('./routes/adminroutes');
const passwordReset = require('./routes/passwordReset');
const Access = require('./models/access');
const Token = require('./models/tokens');
const Users = require('./models/users');
const passport = require('passport');
const LocalStrategy = require('passport-local');
// const dbUrl = 'mongodb://localhost:27017/nftpro';
const dbUrl = process.env.DB_URL;
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');


// mongodb database setup starts
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true})

const db = mongoose.connection;
    db.on("error", console.error.bind(console, "connection error:"));
    db.once("open", () => {
        console.log("Database connected")
    })

// mongodb database setup ends

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/views'));
app.use(methodOverride('_method'));

app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(express.static(path.join(__dirname, 'public')));


const secret = process.env.SECRET ||  'thisshouldbeabettersecret';

const store = MongoStore.create({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24  * 60 * 60
});

store.on("error", function(e){
    console.log("SESSION STORE ERROR", e)
})

// passport configuration start
const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(Users.authenticate()));
passport.serializeUser(Users.serializeUser());
passport.deserializeUser(Users.deserializeUser());

app.use( async (req, res, next) => {
    // console.log(req.query)
    res.locals.currentUser = req.user;
    res.locals.session = req.session;
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next();
})


app.get('/', async(req, res) => {
    res.render("homepage")
})

app.use('/', webRoutes)
app.use('/', adminRoutes)
app.use('/', passwordReset)

const port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log(`Serving on port ${port}` )
});