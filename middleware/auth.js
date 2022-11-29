const jwt = require('jsonwebtoken');

const User = require('../model/user');

exports.authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization');
        console.log('jwt token>>>>>>',token);
        const userId = Number(jwt.verify(token, process.env.TOKEN_KEY));
        const user= await User.findByPk(userId);
        // console.log(JSON.stringify(user));
        req.user = user;
        next();
    } catch(err) {
        console.log(err);
        return res.status(401).json({success: false});
    }
}