require('dotenv').config();
const expresss = require('express');
const path = require('path');
const { OAuth2Client } = require('google-auth-library');
const con = require('./config/db');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const checkUser = require('./checkUser');

const app = expresss();
app.set('view engine', 'ejs');
app.use(expresss.static(path.join(__dirname, 'public')));
app.use(expresss.urlencoded({extended: true}));
app.use(expresss.json());

// =============== Session management =============
app.use(session({
    cookie: { maxAge: 24*60*60*1000, httpOnly: true },
    store: new MemoryStore({
        checkPeriod: 24*60*60*1000
    }),
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false
}));

// =============== Page routes =============
app.get('/', (req, res) => {
    if(req.session.user) {
        res.redirect('/welcome');
    }
    else {
        res.render('login');
    }
});

app.get('/welcome', checkUser, (req, res) => {
    res.render('welcome', {user: req.session.user});
});

// =============== Other routes =============
const client = new OAuth2Client(process.env.CLIENT_ID);
app.post('/verifyUser', (req, res) => {
    const token = req.body.token;
    if(token) {
        client.verifyIdToken({
            idToken: token,
            audience: process.env.CLIENT_ID
        }).then((ticket) => {
            const payload = ticket.getPayload();
            // console.log(payload);
            const email = payload.email;
            // TODO: verify user with DB
            const sql = 'SELECT userID, role FROM user WHERE email=?';
            con.query(sql, [email], (err, result) => {
                if(err) {
                    console.log(err);
                    return res.status(500).send('Database error');
                }
                // check whether the user is our member
                if(result.length != 1) {
                    return res.status(400).send('Not a memeber');
                }
                // check whether the user is active
                if(result[0].role == 0) {
                    return res.status(400).send('Inactive memeber');
                }
                // save user data to session
                req.session.user = {'username': payload.name, 'userID': result[0].userID, 'role': result[0].role};
                res.send('/welcome');
            });          
        }).catch((err) => {
            console.log(err);
            res.status(400).send('Token is invalid');
        })
    }
    else {
        console.log('No token');
        res.status(400).send('No token');
    }
});

app.get('/logout', (req, res) => {
    // destroy all sessions
    req.session.destroy((err) => {
        if(err) {
            console.log(err);
        }
        res.redirect('/');
    });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log('Server starts at ' + PORT);
});