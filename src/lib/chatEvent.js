const io = require('../configs/socketConfig');

const activeUsers = new Map();

io.on("connection", (socket) => {
  // console.log('---socket connected--- ' + socket.id);

  socket.on('userConnected', (userId) => {
    activeUsers.set(socket.id, { userId });
    emitActiveUsers();
  });

  socket.on('joinRoom', (chatId) => {
    socket.join(chatId)
    console.log(`Socket ${socket.id} joined room ${chatId}`);
  })

  socket.on('leaveRoom', (chatId) => {
    socket.leave(chatId)
    console.log(`Socket ${socket.id} left room ${chatId}`);
  })

  socket.on('sendMessage', (message, receiverId, selectedChat) => {
    console.log(`Message received from ${message.senderId} userId  for chat ${message.chatId} id`);
    socket.to(message.chatId).emit('receiveMessage', message)

    const recipientSocket = Array.from(activeUsers.entries()).find(([id, user]) => user.userId === receiverId);
    // active
    if (recipientSocket) {
      const [recipientSocketId, recepientUser] = recipientSocket
      const isRecipientInChat = io.sockets.sockets.get(recipientSocketId)?.rooms.has(message.chatId)
      // not in chat
      if (!isRecipientInChat) {
        const notificationData = {
          ...message,
          isGroupChat: selectedChat.isGroupChat,
          chatPicture: selectedChat.chatPicture,
          chatName: selectedChat.chatName,
          sender: selectedChat.chatUsers.find(user => user.id === message.senderId),
        }
        io.to(recipientSocketId).emit('receiveNotification', notificationData)
      }
      // not active not in chat
    } else {
      sendNotification(receiverId, message)
    }

  })

  socket.on('typing', ({ chatId }) => {
    console.log('someone is typing ın chat', chatId);
    socket.to(chatId).emit('typing')
  })

  socket.on('stopTyping', ({ chatId }) => {
    console.log('someone is stpped in chat', chatId);
    socket.to(chatId).emit('stopTyping');
  });


  socket.on('disconnect', () => {
    // console.log('---socket disconnected---' + socket.id);

    activeUsers.delete(socket.id);
    emitActiveUsers();
  });

  const emitActiveUsers = () => {
    const users = Array.from(activeUsers.values());
    io.emit('activeUsers', users);
  };

  const sendNotification = (userId, message) => {
    //  push notification service or email service 
    console.log(`Sending notification to user ${userId} about message: ${message.content}`);

  };


});


// Function to manually reset a socket connection by its ID
function resetSocketConnection(socketId) {
  const socket = io.sockets.sockets.get(socketId);
  if (socket) {
    console.log(`Manually resetting connection for socket ${socketId}`);
    socket.disconnect();
    // Optionally, reconnect the socket
    // socket.connect();
  } else {
    console.log(`Socket with ID ${socketId} not found`);
  }
}

// Example usage
// resetSocketConnection('2GM0KNX69zOZyfTeAAAB');

module.exports = io