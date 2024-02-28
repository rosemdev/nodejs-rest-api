let io;
module.exports = {
	init: (httptServer) => {
		io = require('socket.io')(httptServer, {
			cors: {
				origin: 'http://localhost:3000',
				methods: ['GET', 'POST'],
			},
		});

		return io;
	},

	getIO: () => {
		if (!io) {
			throw new Error('Socket.io is not initialized!');
		}

		return io;
	},
};
