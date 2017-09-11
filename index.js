const express = require('express'),
    socketio = require('socket.io'),
	http = require('http'),
    fs = require('fs'),
    Users = require('./public/state.js');

const users = new Users();
let totalPizzas = 1;
const app = express();
const server = http.Server(app);
const io = socketio(server);

const onExit = () => {
    fs.writeFileSync('backup.json', JSON.stringify({
        users: users.users,
        npizzas: totalPizzas
    }), 'utf8');
    process.exit();
};

process.on('SIGINT', onExit);
process.on('exit', onExit);

try {
    const d = require('./backup.json');
    users.init(d.users);
    totalPizzas = d.npizzas;
}
catch(e) {}

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

const onInit = socket => {
    socket.emit('init', {
        users: users.users,
        totalPizzas: totalPizzas
    });
};

const onReset = socket => {
    users.init([]);
    onInit(socket);
}

const onNumPizzas = (socket, num) => {
    totalPizzas = num;
    socket.broadcast.emit('num_pizzas', num);
};

io.on('connection', socket => {
    users.configureSocket(socket, true);
	socket.on('init', onInit.bind(this, socket));
	socket.on('reset', onReset.bind(this, socket));
    socket.on('num_pizzas', onNumPizzas.bind(this, socket));
	socket.on('disconnect', () => socket.removeAllListeners());
});

server.listen(1234);
