const express = require('express');
const router = express.Router();
const methods = require('../../methods')

let states = []

router.post('/', (req, res) => {
    let state = {};
    state.username = req.body.username.toUpperCase();
    methods.authentication.authenticateStudent(state.username)
        .then(result => {
            state.token = result.token;
            res.render('otp', { user: state.username, msg: "" })
            states.push(state);
        })
        .catch(err => {
            res.redirect("/?success=false")
        })
})

router.post('/confirmOtp', (req, res) => {
    console.log('states');
    console.log(states);
    const state = states.filter(i => i.username === req.body.username).reverse()[0]

    if (state.token === req.body.otp) {
        username = req.body.username;
        methods.authentication.authenticateStud(username)
            .then(result => {
                console.log("Logged in")
                console.log(result.token)
                req.token = result.token
                req.session.token = result.token
                states = states.filter(i => i.username !== username);
                if (result.type === "student") {
                    res.redirect("/student/dashboard")
                }

            })
            .catch(err => {
                states = states.filter(i => i.username !== username);
                console.log(err)
                res.status(400).json({ success: false })
            })
    }
    else {
        username = req.body.username
        res.render('otp', { user: username, msg: "Incorrect OTP" })
    }
})

module.exports = router;