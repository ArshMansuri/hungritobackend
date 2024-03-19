const Order = require("../../model/Order");

exports.dbNewOrderAdd = async (io, orderId, onlineDeliveryBoy) => {
  try {
    const newOrder = await Order.findById(orderId)
      .populate({
        path: "userId",
        select: "username",
      })
      .populate({
        path: "orders.restu.resId",
        select: "resName resAddress resLatLong",
      })
      .select("-password ");

      if(newOrder !== undefined){
        const delBoyId = newOrder?.deliveryBoyId.toString()
        const socketId = onlineDeliveryBoy.get(delBoyId)
        if(socketId !== undefined){
            io.to(socketId).emit("new-order-add-in-delboy", {newOrder})
            io.to(socketId).emit("new-order-notification-for-delboy", {isNewOrderAvailable: true})
        } else {
            console.log("socket id not found..........");
        }
      }
  } catch (error) {
    console.log(error);
  }
};
