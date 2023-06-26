const _ = require("lodash");

const handleUserPresenceSocket = async (io, redisClient) => {
  io.on("connection", async (socket) => {
    const {
      id,
      handshake: { query },
    } = socket;

    const { orgIds, userId, isPresenceVisible = "true" } = query;
    const orgIdsArr = orgIds.split(",");

    if (JSON.parse(isPresenceVisible)) {
      orgIdsArr.forEach(async (orgId) => {
        await redisClient.sAdd(`org:${orgId}:onlineUsers`, userId);
        socket.to(`org:${orgId}`).emit("user-joined", { userId });
      });

      await redisClient.sAdd(`user:${userId}:connections`, id);

      socket.on("disconnect", async (reason) => {
        // remove user's current connection
        await redisClient.sRem(`user:${userId}:connections`, id);
        const activeConnections = await redisClient.sMembers(
          `user:${userId}:connections`
        );
        if (activeConnections.length === 0) {
          orgIdsArr.forEach(async (orgId) => {
            await redisClient.sRem(`org:${orgId}:onlineUsers`, userId);
            io.to(`org:${orgId}`).emit("user-left", { userId });
          });
        }
      });
    }

    // add user's connection to each org's room
    orgIdsArr.forEach((id) => socket.join(`org:${id}`));

    socket.on("getOnlineUsers", async (callback) => {
      const usersPromises = [];
      orgIdsArr.forEach((orgId) => {
        usersPromises.push(redisClient.sMembers(`org:${orgId}:onlineUsers`));
      });
      const allUsers = await Promise.all(usersPromises);
      const result = _.uniq(_.flatten(allUsers));
      callback(result);
    });
  });
};

module.exports = handleUserPresenceSocket;
