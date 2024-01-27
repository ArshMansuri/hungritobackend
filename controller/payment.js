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
            payment_method_types: ['card'],
            payment_method: 'pm_card_in',
            description: 'Hungrito online food delivery service',
            shipping: {
                name: user?.username || 'Jenny Rosen',
                address: {
                  line1: user?.address?.area || '510 Townsend St',
                  postal_code: '382715',
                  city: user?.address?.city || 'San Francisco',
                  state: 'GJ',
                  country: 'IN',
                },
            }
        })
        return res.status(201)
        .json({ success: true, paymentToken: paymentIntent.client_secret, paymentId: paymentIntent.id, paymentMethodId: paymentIntent.payment_method});

    } catch (error) {
                console.log('Catch Error:: ', error)
        return res.status(500).json({
            success: false,
            message: error.message,
          });
    }
}