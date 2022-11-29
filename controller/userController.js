const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');
const uuid = require('uuid');

const User = require('../model/user');
const ForgotPassword = require('../model/forgot-password');

function generateAccessToken(id) {
    return jwt.sign(id, 'bigerkey12345');
}

exports.signUp = (req, res) => {
    const {name, email, telephone, password} = req.body;
    // console.log(req.body)
    const saltRounds = 10;
    bcrypt.genSalt(saltRounds, function(err, salt) {
        bcrypt.hash(password, salt, function(err, hash) {
            if (err) {
                console.log(err);
                return res.json({message: 'unable to create new user'})
            }
            User.create({name, email, telephone, password: hash})
                .then(() => {
                res.status(201).json({success: true, message: 'sign up successful'})
                })
                .catch(err => {
                    console.log(err);
                    res.status(403).json({success: false, message: 'email or phone number already exits'})
                })
        })
    })
    
}

exports.login = async(req, res) => {
    try{
        const {email, password} = req.body;
        // console.log(req.body)
        const user= await User.findAll({where: {email}});
        if (user.length > 0) {
            bcrypt.compare(password, user[0].password, function(err, response) {
                if (err) {
                    console.log(err);
                    return res.json({success: false, message: 'Something went wrong'});
                }
                if (response) {
                    // console.log(JSON.stringify(user));
                    const jwtToken = generateAccessToken(user[0].id);
                    //console.log(user[0]);
                    res.status(200).json({token: jwtToken, userId: user[0].id, success: true, message: 'successfully logged in', premium: user[0].isPremiumuser});
                }
                else {
                    return res.status(401).json({success: false, message: 'password do not match'});
                }
            })
        }
        else {
            return res.status(404).json({success: false, message: 'user does not exist'});
        }
    }catch(err){
        console.log(err);
        res.status(500).json({message:'server error'})
    }
}

exports.forgotPassword = async (req, res) => {
    try {
        const {email} = req.body;
        console.log(email);
        const user = await User.findOne({ where: { email } });
        if (user) {
            const id = uuid.v4();
            console.log(id);
            user.createForgotpassword({ id, active: true })
                .catch(err => {
                    throw new Error(err)
                })

            sgMail.setApiKey(process.env.SENGRID_API_KEY)

            const msg = {
                to: email,
                from: 'yj.rocks.2411@gmail.com',
                subject: 'sending with sendgrid',
                text: 'password reset mail',
                html: `<a href='http://localhost:3000/reset-password/${id}'>Reset Password</a>`
            }

            sgMail.send(msg).then(response => {
                return res.status(response[0].statusCode).json({ message: 'link to password reset sent to mail', success: true })
            }).catch(err => {
                throw new Error(err);
            })
        } else {
            throw new Error('user does not exist');
        }
    } catch (err) {
        console.log(err);
        res.json({ message: err, success: false })
    }
}

exports.resetPassword = async(req, res) => {
    try{
        const {id} = req.params;
        const forgotpasswordreq= await ForgotPassword.findOne({where: {id}})
        if (forgotpasswordreq) {
            forgotpasswordreq.update({active: false});
            res.status(200).send(`<html>
            <script>
            function formsubmitted(e) {
                e.preventDefault();
                console.log('called')
            }
            </script>
            <form action='/update-password/${id}' method='get'>
            <label for='newPass'>Enter New Password</label>
            <input name='newPass' type='password' required></input>
            <button>Reset Password</button>
            </form>
            </html>`)
            res.end()
        }
    }catch(err){
        console.log(err);
    }
}

exports.updatepassword = async(req, res) => {
    try{
        const {newPass} = req.query;
        // console.log(newPass);
        const {resetPassId} = req.params;
        // console.log(resetPassId);
        const resetpasswordreq= await ForgotPassword.findOne({where: {id: resetPassId}});
        const user= await User.findOne({where: {id: resetpasswordreq.userId}});
        if (user) {
            const saltRounds = 10;
            bcrypt.genSalt(saltRounds, function(err, salt) {
                if (err) {
                    console.log(err);
                }
                bcrypt.hash(newPass, salt, function(err, hash) {
                    if (err) {
                        console.log(err);
                    }
                    user.update({password: hash}).then(() => {
                        res.status(201).json({message: 'Successfully updated the new password'})
                    })
                })
            })
        } else {
            return res.status(404).json({error: 'No user exists', success: false})
        }
    } catch(error) {
        console.log(error);
        res.status(400).json({error: 'No user exists', success: false})
    }
}
