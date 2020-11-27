// Required packages
const express = require('express');
const session = require('express-session');
const pug = require('pug');
const bodyParser = require('body-parser');
const path = require('path');
const routes = require('./routes/routes');
const cookieParser = require('cookie-parser');

// Middleware
const app = express();
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Things the site is using
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use(session({secret: "WeAl6S6aXZN2ffnIf1hWYw==", saveUninitialized: true, resave: true, unset: 'destroy'}));
app.use((req, res, next) => {
    if(req.session.user) {
            req.session.user.isLoggedIn = !(!req.session.user.username)
    } else {
        req.session.user = {};
        req.session.user.isLoggedIn = false;
    }
    next();
});
app.use(express.static(path.join(__dirname + '/public')));
app.use(cookieParser('This is my passphrase'));

const urlencodedParser = bodyParser.urlencoded({
    extended: true
});

// If user is authenticated it will proceeds to the requested path else redirects to home page
const checkAuth = (req, res, next) => {
    if (req.session.user && req.session.user.isAuthenticated) {
        next();
    } else {
        res.redirect('/login')
    }
}

// PUBLIC PAGES - Needs no authentication
app.get('/', routes.index);
app.get('/login', routes.login);
app.post('/login', urlencodedParser, routes.verifyLogin);
app.get('/create', routes.create);
app.post('/create', urlencodedParser, routes.createUser);
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        } else {
            res.clearCookie('connect.sid').redirect('/');
        }
    })
});

// Servers listening port
app.listen(3000, console.log("Listening at http://localhost:3000"));