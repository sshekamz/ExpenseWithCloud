const Razorpay = require('razorpay');

const Order = require('../model/order');
const User= require('../model/user');

exports.premium = async (req, res) => {
    try {
        var rzp = new Razorpay({
            key_id: 'rzp_test_AAZ15RVIDhR2SQ',
            key_secret: "orWZkPUmGXgbvrRV326J2Fig"
        });
        const amount = 2500;

        rzp.orders.create({amount, currency: 'INR'}, (err, order) => {
            if (err) {
                throw new Error(err);
            }
            Order.create({orderId: order.id, status: 'PENDING'});
            // console.log(order.id);
            return res.status(201).json({order_id: order.id, key_id: rzp.key_id});
        })
    } catch(err) {
        console.log(err);
        res.status(403).json({message: 'something went wrong', error: err});
    }
}

exports.transactionStatus = async(req, res) => {
    try {
        const {payment_id, order_id} = req.body;
        console.log(req.body);
        await Order.update({paymentId: payment_id, status: 'successful', userId:req.user.id}, {where: {orderId: order_id}});
        User.update({isPremiumuser: true}, {where: {id: req.user.id}});
        return res.status(202).json({success: true, message: 'transaction successful', premium: true});
    } catch(err) {
        console.log(err);
        res.status(403).json({error: err, message: 'Something went wrong'});
    }
}
