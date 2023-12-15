require('dotenv').config({"path": "./config/config.env"})
const express = require('express')
const app = express()
const PORT = process.env.PORT || 6010 
const cors = require('cors')
const bodyparser = require("body-parser")
const user = require('./routes/user')
const restaurant = require('./routes/restaurant')
const food = require('./routes/food')
const cookiParser = require('cookie-parser')
const cloudinary = require("cloudinary")



//================== MiddelWers =====================================
const corsOptions = {
    origin: 'http://localhost:3000/',
    credentials: true, 
  };
  
app.use(cors(corsOptions));  
app.use(bodyparser.json())
app.use(express.json({limit: "50mb"}))
app.use(express.urlencoded({extended: true}))
app.use(cookiParser())

//================== Data Base Connection ===========================
const {connectDataBase} = require('./db/conDB')
const cookieParser = require('cookie-parser')
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
app.use('/api/v1', restaurant)
app.use('/api/v1', food)


app.get('/', (req,res)=>{
    res.send("HungriTo")
})


//=================== Server Start ====================================
app.listen(PORT, ()=>{
    console.log(`App listen on port ${PORT}`)
})

