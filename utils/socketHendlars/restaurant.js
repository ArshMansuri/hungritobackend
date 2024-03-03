const Order = require("../../model/Order");

exports.resNewOrderAdd = async (io, orderId, onlineRestaurant) => {
  try {
    const order = await Order.findById(orderId)
      .populate({ path: "orders.restu.foods.foodId", select: "foodWeight" })
      .populate({ path: "userId", select: "username" });

    if (order !== undefined) {
      console.log(order?.orders?.restu?.length);
      for (let i = 0; i < order?.orders?.restu?.length; i++) {
        const resId = order?.orders?.restu[i]?.resId.toString();
        const socketId = onlineRestaurant.get(resId);
        if (socketId !== undefined) {
          let sendOrders = JSON.parse(JSON.stringify(order));
          sendOrders.orders.restu = [];
          sendOrders.orders.restu[0] = order.orders.restu[i];
          io.to(socketId).emit("new-order-add-in-res", {
            sendOrders: JSON.stringify(sendOrders),
          });
        } else {
          console.log("socket id not found..........");
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
};
