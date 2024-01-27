const Food = require("../model/Food");
const Restaurant = require("../model/Restaurant");
const cloudinary = require("cloudinary");

exports.createFoodCart = async (req, res) => {
  try {
    const {
      foodName,
      img,
      foodPrice,
      foodType,
      foodDescription,
      foodCategory,
      foodWeight,
      foodOffer,
    } = req.body;

    if (
      !foodName ||
      !img ||
      !foodPrice ||
      !foodType ||
      !foodDescription ||
      !foodCategory ||
      !foodWeight
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Enter All Fild" });
    }

    if (foodOffer.isOffer && foodOffer.offer === "") {
      return res
        .status(400)
        .json({ success: false, message: "Enter About Offer" });
    }

    const myCloud = await cloudinary.v2.uploader.upload(img, {
      folder: "hungriTo/food",
    });

    const foodImage = {
      publicId: myCloud.public_id,
      publicUrl: myCloud.secure_url,
    };

    const newFoodObj = {
      foodName,
      foodImage,
      foodPrice,
      foodType,
      foodCategory,
      foodDescription,
      foodRestaurant: req.restu._id,
      foodWeight,
      foodOffer,
    };

    const food = await Food.create(newFoodObj);

    const restu = await Restaurant.findById(req.restu._id);
    restu.foodList.unshift(food._id);
    await restu.save();
    return res.status(201).json({
      success: true,
      message: "Food Cart Created Successfully",
    });
  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateFoodCart = async (req, res) => {
  try {
    const {
      foodName,
      img,
      foodPrice,
      foodType,
      foodDescription,
      isAvilable,
      foodCategory,
      foodWeight,
      foodOffer,
    } = req.body;

    const { foodId } = req.params;

    if (!foodId) {
      return res.status(400).json({
        success: false,
        message: "There Is Issue, Food Id Not Pass",
      });
    }

    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(400).json({
        success: false,
        message: "There Is Issue, Please Refrese A Page (Food Not Found)",
      });
    }

    if (foodName) {
      food.foodName = foodName;
    }

    if (img) {
      console.log("inn");
      const myCloud = await cloudinary.v2.uploader.upload(img, {
        folder: "hungriTo/food",
      });
      food.foodImage.publicUrl = myCloud.secure_url;
      food.foodImage.publicId = myCloud.public_id;
      console.log(myCloud.secure_url);
    }

    if (foodPrice) {
      food.foodPrice = foodPrice;
    }

    if (foodType) {
      food.foodType = foodType;
    }

    if (foodDescription) {
      food.foodDescription = foodDescription;
    }

    if (isAvilable !== undefined) {
      food.isAvilable = isAvilable;
    }

    if (foodCategory) {
      food.foodCategory = foodCategory;
    }

    if (foodDescription) {
      food.foodDescription = foodDescription;
    }

    if (foodWeight) {
      food.foodWeight = foodWeight;
    }

    if (foodOffer) {
      food.foodOffer = foodOffer;
    }

    await food.save();

    return res.status(202).json({
      success: true,
      message: "Food Detail Update Successfully",
    });
  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateFoodCartIsAvailable = async (req, res) => {
  try {
    const { foodId } = req.params;
    const { isAvailable } = req.body;

    if (!foodId) {
      return res.status(400).json({
        success: false,
        message: "There Is Issue, Food Id Not Pass",
      });
    }

    if (isAvailable !== true && isAvailable !== false) {
      return res.status(400).json({
        success: false,
        message: "There Is Issue",
      });
    }

    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(400).json({
        success: false,
        message: "There Is Issue, Please Refrese A Page (Food Not Found)",
      });
    }

    food.isAvailable = isAvailable;

    await food.save();

    return res.status(202).json({
      success: true,
      message: "Food Successfully",
    });
  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteFoodCart = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(400).json({
        success: false,
        message: "There Is Issue, Please Refrese A Page (Food Not Found)",
      });
    }

    if (food.isDelete === true) {
      return res.status(400).json({
        success: false,
        message: "There Is Issue, Please Refrese A Page (Food Alrady Deleted)",
      });
    }

    food.isDelete = true;
    food.isAvailable = false;
    await food.save();

    // const restu = await Restaurant.findById(req.restu._id)

    // if(restu.foodList.includes(req.params.id)){
    //     const index = restu.foodList.indexOf(req.params.id)
    //     restu.foodList.splice(index, 1)
    //     await restu.save()
    // }

    return res.status(200).json({
      success: true,
      message: "Food Cart Delete Successfully",
    });
  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getResFoodList = async (req, res) => {
  try {
    const foods = await Restaurant.findOne(
      {_id: req.restu._id},
      { foodList: 1, _id: 0 }
    ).populate({
      path: "foodList",
      match: { isDelete: false },
      populate: { path: "foodCategory" },
    });

    return res.status(200).json({
      success: true,
      foods: foods?.foodList || [],
    });
  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.getResSingleFoodList = async (req, res) => {
  try {
    if (!req.params.foodId) {
      return res.status(400).json({
        success: false,
        message: "Don't have food id",
      });
    }
    const food = await Food.findById(req.params.foodId);

    if (!food) {
      return res.status(400).json({
        success: false,
        message: "There Is Issue, Please Refrese A Page (Food Not Found)",
      });
    }

    return res.status(200).json({
      success: true,
      food,
    });
  } catch (error) {
    console.log("Catch Error:: ", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
