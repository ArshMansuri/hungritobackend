exports.userOrderLiveLocation = async (io, location, userId, onlineCustomers) => {
    try {
        const socketId = onlineCustomers.get(userId)
        if(socketId){
            io.to(socketId).emit("db-live-location", {location})
        }
    } catch (error) {
        console.log(error)
    }
}