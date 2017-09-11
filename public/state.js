class Users {
    constructor() {
        this.init([]);
    }

    init(users) {
        this.users = users;
    }

    configureSocket(io, server = false) {
        const events = {};
        events['order_knots_add'] = user => this.users.find(u => u.name === user.name).garlicKnots = true;
        events['order_knots_remove'] = user => this.users.find(u => u.name === user.name).garlicKnots = false;
        events['order_leave'] = user => this.users.find(u => u.name === user.name).joined = false;
        events['order_joined'] = user => this.users.find(u => u.name === user.name).joined = true;
        events['add_user'] = this.addUser.bind(this);
        events['remove_user'] = this.removeUser.bind(this);

        for (let event in events) {
            io.on(event, (...data) => {
                events[event](...data);
                if (server) {
                    io.broadcast.emit(event, ...data);
                }
            });
        }
    }

    addUser(user) {
        this.users.push(user);
        this.users.sort((a, b) => {
            if (a < b) {
                return 1;
            }
            else if (a > b) {
                return -1;
            }
            return 0;
        });
    }

    removeUser(user) {
        const ind = this.users.findIndex(u => u.name === user.name);
        this.users.splice(ind, 1);
    }
}

if (typeof(module) !== 'undefined') {
    module.exports = Users;
}
else {
    // node.js has a runtime compile failure without eval
    window.Users = Users;
}
