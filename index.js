const express = require('express'),
    socketio = require('socket.io'),
	http = require('http');

const app = express();
const server = http.Server(app);
const io = socketio(server);

app.use((req, res, next) => {
	req.body = '';
	req.setEncoding('utf8');
	req.on('data', chunk => req.body += chunk);
	req.on('end', next);
});

app.use(express.static('public'));

app.get('/api/:pizza(iwantpizz+a)', (req, res) => {
	res.status(400).json({
		success: false,
		error: 'One does not simply get given pizza. Pizza must be requested.'
	});
});

app.post('/api/:pizza(iwantpizz+a)', (req, res) => {
	try {
		const j = !!req.body ? JSON.parse(req.body) : {};
		if (!j.please) {
			res.status(400).json({
				success: false,
				error: 'Your request was insufficiently polite.'
			});
		}
		else if (req.params.pizza.length < 15 || !j.email || !j.name) {
			res.status(400).json({
				success: false,
				error: 'Obviously you dont want pizza enough. Come back when you do.'
			});
		}
		else {
			res.status(418).json({
				success: false,
				error: 'This is the api for brewing tea not ordering pizza.'
			});
		}
	}
	catch (e) {
		res.status(400).json({
            success: false,
            error: 'Pizza consists of 3 main components: a base (HTTP), a sauce (POST) and toppings (JSON). You just tried to order pizza without at least one of these.'
        });
	}
});

const orders = [];

const onInit = socket => {
	const today = new Date();
	const countdownUntil = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 30).getTime();
	socket.emit('init', {
		countdownUntil: countdownUntil,
		orders: orders
	});
};

const onReset = socket => {
	orders = [];
	onInit(socket);
};

const onOrder = (socket, order) => {
    socket.broadcast.emit('order', order);
};

const onSpecs = (socket, spec) => {
    socket.broadcast.emit('specs', spec);
};

io.on('connection', socket => {
	socket.on('init', onInit.bind(this, socket));
	socket.on('reset', onReset.bind(this, socket));
	socket.on('order', onOrder.bind(this, socket));
	socket.on('specs', onSpecs.bind(this, socket));
	socket.on('disconnect', () => socket.removeAllListeners());
});

server.listen(1234);
