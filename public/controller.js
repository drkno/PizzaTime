const pizzaApp = angular.module("pizzaApp", ['btford.socket-io', 'ngSanitize']);
pizzaApp.filter('trusted', function($sce){
	return function(html){
		return $sce.trustAsHtml(html);
	}
});
pizzaApp.factory('pSocket', function (socketFactory) {
    return socketFactory();
});
pizzaApp.controller("PizzaCtrl", function($scope, $interval, pSocket) {
    $scope.newPerson = {};
    $scope.remainingTime = 'Loading...';
    $scope.timeout = false;
    $scope.totalPizzas = 1;
    $scope.users = new window.Users();

    $scope.users.configureSocket(pSocket);

    $scope.changeNumSlices = user => {
        if (user.slices < 1 || isNaN(user.slices)) {
            user.slices = 1;
        }
        pSocket.emit('order_num_slices', user);
    };

    $scope.notifyPizzaNumber = () => {
        if ($scope.totalPizzas < 1 || isNaN($scope.totalPizzas)) {
            $scope.totalPizzas = 1;
        }
        pSocket.emit('num_pizzas', $scope.totalPizzas);
    };
    pSocket.on('num_pizzas', num => $scope.totalPizzas = num);

    $scope.calcOwes = u => {
        let totalGarlic = 0;
        let totalPeople = 0;
        for (let user of $scope.users.users) {
            if (user.joined) {
                if (user.garlicKnots) {
                    totalGarlic += 1;
                }
                totalPeople++;
            }
        }

        let total = ($scope.totalPizzas * 35.0) / totalPeople;
        if (u.garlicKnots) {
            const garlicCost = Math.floor(totalGarlic / 3) * 4.0 + (totalGarlic % 3) * 1.5;
            total += garlicCost / totalGarlic;
        }
        return total.toFixed(2);
    };

    $scope.joinedFilter = item => item.joined;

    const pad = t => t < 10 ? '0' + t.toString() : t.toString();
    $interval(() => {
    	const now = new Date();
        const until = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 11, 30, 0);

        let diff = until - now;

        const hours = Math.floor(diff / 3600000);
        diff -= hours * 3600000;

        const mins = Math.floor(diff / 60000);
        diff -= mins * 60000;

        const secs = Math.floor(diff / 1000);

        if (until - now < 0 && !$scope.timeout) {
            $scope.timeout = true;
        }
        else if (until - now > 0 && $scope.timeout) {
            for (let user of $scope.users.users) {
                $scope.removeUser(user);
            }
            $scope.timeout = false;
        }

        $scope.remainingTime = `${pad(hours)}:${pad(mins)}:${pad(secs)}`;
    }, 1000);


    //#region InitReset

    pSocket.on('init', data => {
        $scope.users.init(data.users);
        $scope.totalPizzas = data.totalPizzas;
    });
    pSocket.emit('init');

    $scope.resetEverything = () => {
        pSocket.emit('reset');
    };

    //#endregion InitReset
    //#region Join Order

    $scope.toggleGarlicKnots = user => {
        if (user.garlicKnots) {
            pSocket.emit('order_knots_add', user);
        }
        else {
            pSocket.emit('order_knots_remove', user);
        }
    };

    //#endregion Garlic Knots
    //#region Leave Order

    $scope.leaveOrder = user => {
        pSocket.emit('order_leave', user);
        user.joined = false;
    };

    //#endregion Leave Order
    //#region Join Order

    $scope.joinOrder = user => {
        pSocket.emit('order_joined', user);
        user.joined = true;
    };

    //#endregion Join Order
    //#region Add User

    const resetUserInput = () => {
        $scope.newPerson = {
            name: '',
            joined: true,
            garlicKnots: false,
            payer: false
        };
    };

    $scope.addUser = () => {
        if ($scope.users.users.find(u => u.name === $scope.newPerson.name)) {
            return alert('Cannot add another person with the same name.');
        }
        pSocket.emit('add_user', $scope.newPerson);
        $scope.users.addUser($scope.newPerson);
        resetUserInput();
    };

    resetUserInput();

    //#endregion Add User
    //#region Remove User

    $scope.removeUser = user => {
        pSocket.emit('remove_user', user);
        $scope.users.removeUser(user);
    };

    //#endregion Remove User
});
