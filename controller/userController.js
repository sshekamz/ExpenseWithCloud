const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../model/user');

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
                    res.status(200).json({token: jwtToken, userId: user[0].id, success: true, message: 'successfully logged in', premium: user[0].ispremiumuser});
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

