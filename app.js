require('dotenv').config({"path": "./config/config.env"})
const express = require('express')
const app = express()
const PORT = process.env.PORT || 6010 
const http = require('http')
const cors = require('cors')
const bodyparser = require("body-parser")
const user = require('./routes/user')
const restaurant = require('./routes/restaurant')
const food = require('./routes/food')
const admin = require('./routes/admin')
const payment = require('./routes/payment')
const oredr = require('./routes/order')
const delBoy = require('./routes/delBoy')
const cookiParser = require('cookie-parser')
const cloudinary = require("cloudinary")
const socketIo = require('socket.io');


//================== MiddelWers =====================================
const corsOptions = {
    origin: true,
    credentials: true, 
};

const server = http.createServer(app)
const io = socketIo(server)

app.use(cors(corsOptions));  
app.use(bodyparser.json({limit: "50mb"}))
app.use(express.json({limit: "50mb"}))
app.use(express.urlencoded({extended: true}))
app.use(cookiParser())

//================== Data Base Connection ===========================
const {connectDataBase} = require('./db/conDB')
connectDataBase()


//================== Cloudinary Config =============================
// cloudinary.config({
//     cloud_name: process.env.CLOUD_NAME,
//     api_key: process.env.CLOUD_API_KEY,
//     api_secret: process.env.CLOUD_API_SECRET
// })
cloudinary.config({
    cloud_name: "dbirutg8t",
    api_key: "619987263695353",
    api_secret: "4zQhnQHPG03lm4dJ15WFG--tMNc"
})


//=================== Routers =======================================
app.use('/api/v1', user)
app.use('/api/v1', oredr)
app.use('/api/v1', payment)
app.use('/api/v1', restaurant)
app.use('/api/v1', food)
app.use('/api/v1', admin)
app.use('/api/v1', delBoy)


app.get('/', (req,res)=>{
    res.send("HungriTo")
})


//=================== Socket Code ====================================
const onlineCustomers = new Map();
const onlineRestaurant = new Map();
const onlineDeliveryBoy = new Map();

function updateSocketId(map, userId, socketId) {
    if (map.has(userId)) {
        const oldSocketId = map.get(userId);
        if (oldSocketId !== socketId) {
            map.delete(userId);
        }   
    }
    map.set(userId, socketId);
}

io.on('connection', (socket)=>{
    console.log(`User connected: ${socket.id}`);
    socket.on('user-online', ({userId})=>{
        console.log(userId, socket.id)
        // onlineCustomers.set(userId, socket.id);
        updateSocketId(onlineCustomers, userId, socket.id);
    })

    socket.on('deliveryBoy-online', ({dbId})=>{
        console.log(dbId, socket.id)
        // onlineDeliveryBoy.set(dbId, socket.id);
        updateSocketId(onlineDeliveryBoy, dbId, socket.id);
    })

    socket.on('restaurant-online', ({resId})=>{
        console.log(resId, socket.id)
        // onlineRestaurant.set(resId, socket.id);
        updateSocketId(onlineRestaurant, resId, socket.id);
    })


    socket.on('disconnect', () => {
        onlineCustomers.forEach((value, key) => {
            if (value === socket.id) {
                onlineCustomers.delete(key);
            }
        });

        onlineDeliveryBoy.forEach((value, key) => {
            if (value === socket.id) {
                onlineDeliveryBoy.delete(key);
            }
        });

        onlineRestaurant.forEach((value, key) => {
            if (value === socket.id) {
                onlineRestaurant.delete(key);
            }
        });
    });
})



//=================== Server Start ====================================
server.listen(PORT, ()=>{
    console.log(`App listen on port ${PORT}`)
})
