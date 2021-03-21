require('dotenv').config();
const expresss = require('express');
const path = require('path');
const { OAuth2Client } = require('google-auth-library');
const con = require('./config/db');

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

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log('Server starts at ' + PORT);
});