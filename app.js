require('dotenv').config();
const expresss = require('express');
const path = require('path');
const { OAuth2Client } = require('google-auth-library');

const app = expresss();
app.set('view engine', 'ejs');
app.use(expresss.static(path.join(__dirname, 'public')));
app.use(expresss.urlencoded({extended: true}));
app.use(expresss.json());

// =============== Page routes =============
app.get('/', (req, res) => {
    res.render('login');
});

app.get('/welcome', (req, res) => {
    res.render('welcome');
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
            // console.log(email);
            res.send('/welcome');
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

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log('Server starts at ' + PORT);
});