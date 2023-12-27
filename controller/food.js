const Food = require("../model/Food");
const Restaurant = require("../model/Restaurant");
const cloudinary = require('cloudinary')

exports.createFoodCart = async(req,res)=>{
    try {

        const {foodName, img, foodPrice, foodType, foodDescription, isAvilable} = req.body

        if(!foodName || !img || !foodPrice || !foodType){
            return res.status(400)
            .json({ success: false, message: "Enter All Fild" });
        }

        const myCloud = await cloudinary.v2.uploader.upload(img, {
            folder: "foodappp"
        })

        const foodImage = {
            publicId: myCloud.public_id,
            publicUrl: myCloud.secure_url
        }

        const newFoodObj = {
            foodName,
            foodImage,
            foodPrice,
            foodType,
            foodDescription,
            foodRestaurant: req.restu._id,
            isAvilable
        }

        const food = await Food.create(newFoodObj)
        newFoodObj._id = food._id

        const restu = await Restaurant.findById(req.restu._id)
        restu.foodList.unshift(food._id)
        await restu.save()
        return res.status(201).json({
            success: true,
            newFoodObj,
            message: "Food Cart Create Successfully"
        })

    } catch (error) {
        console.log('Catch Error:: ', error)
        return res.status(500).json({
            success: false,
            message: error.message,
          });
    }
}

exports.updateFoodCart = async(req, res)=>{
    try {
        const {foodName, img, foodPrice, foodType, foodDescription, isAvilable} = req.body
        if(!foodName && !img && !foodPrice && !foodDescription && isAvilable === undefined){
            return res.status(200).json({
                success: false,
                message: "Not Need To Change"
            })
        }

        const food = await Food.findById(req.params.id)
        if(!food){
            return res.status(400).json({
                success: false,
                message: "There Is Issue, Please Refrese A Page (Food Not Found)"
            })
        }

        if(foodName){
            food.foodName = foodName
        }

        if(img){
            const myCloud = await cloudinary.v2.uploader.upload(img, {
                folder: "foodappp"
            })
            food.publicUrl = myCloud.secure_url
            food.publicId = myCloud.secure_url
        }

        if(foodPrice){
            food.foodPrice = foodPrice
        }

        if(foodType){
            food.foodType = foodType
        }

        if(foodDescription){
            food.foodDescription = foodDescription
        }

        if(isAvilable !== undefined){
            food.isAvilable = isAvilable
        }

        await food.save()

        return res.status(202).json({
            success: true,
            message: "Food Cart Update Successfully",
            food
        })
        
    } catch (error) {
        console.log('Catch Error:: ', error)
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

exports.deleteFoodCart = async(req, res)=>{
  try {
    const food = await Food.findById(req.params.id)

    if(!food){
        return res.status(400).json({
            success: false,
            message: "There Is Issue, Please Refrese A Page (Food Not Found)"
        })
    }

    if(food.isDelete === true){
        return res.status(400).json({
            success: false,
            message: "There Is Issue, Please Refrese A Page (Food Alrady Deleted)"
        })
    }

    food.isDelete = true
    food.isAvilable = false
    await food.save()

    const restu = await Restaurant.findById(req.restu._id)

    if(restu.foodList.includes(req.params.id)){
        const index = restu.foodList.indexOf(req.params.id)
        restu.foodList.splice(index, 1)
        await restu.save()
    }

    return res.status(200).json({
        success: true,
        message: "Food Cart Delete Successfully"
    })

  } catch (error) {
    console.log('Catch Error:: ', error)
    return res.status(500).json({
        success: false,
        message: error.message,
    });
  }
}