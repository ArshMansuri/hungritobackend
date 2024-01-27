const Stripe = require("stripe");
const User = require("../model/User");
const stripe = new Stripe(process.env.STRIPE_KEY) 


exports.createUserPayment = async (req, res) => {
    try {
        const {amount} = req.body
        if(!amount){
            return res.status(400)
            .json({ success: false, message: "Enter Amount" });
        }

        const user = await User.findById(req.user._id)

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Number(amount) * 100,
            currency: "inr",
            description: 'Hungrito online food delivery service',
            automatic_payment_methods :{
                enabled: true
            }
        })
        return res.status(201)
        .json({ success: true, paymentToken: paymentIntent.client_secret});

    } catch (error) {
                console.log('Catch Error:: ', error)
        return res.status(500).json({
            success: false,
            message: error.message,
          });
    }
}