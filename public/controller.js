const pizzaApp = angular.module("pizzaApp", ['dyFlipClock', 'btford.socket-io']);
pizzaApp.factory('pSocket', function (socketFactory) {
    return socketFactory();
});
pizzaApp.controller("PizzaCtrl", function($scope, $interval, pSocket) {
    let countdownUntil = 0;
    let prices = {};

    $scope.remainingTime = 362439000;
    $scope.orders = [];
    $scope.hasOrdered = false;

    pSocket.on('order', data => {
        $scope.orders.push(data);
    });

    pSocket.on('init', data => {
        $scope.hasOrdered = false;
        countdownUntil = data.countdownUntil;
        $scope.orders = data.orders;
    });

    $interval(() => {
        if (countdownUntil > 0) {
            $scope.remainingTime = Math.max(countdownUntil - Date.now(), 0);
        }
    }, 1000);

    $scope.calcEntitlements = order => {
        return '';
    };

    $scope.calcOwes = order => {
        return 0;
    };

    $scope.countPizza = () => {
        return ['test'];
    };

    $scope.countMisc = () => {
        return ['pizza'];
    };

    $scope.resetAll = () => {
        pSocket.emit('reset');
    };

    $scope.placeOrder = () => {
        const order = {
            name: document.getElementById('inputName').value,
            email: document.getElementById('inputEmail').value,
            flav: document.querySelectorAll('input[name=toppings]:checked').map(e => e.value),
            add: document.querySelectorAll('input[name=other]:checked').map(e => e.value)
        };
        $scope.orders.push(order);
        pSocket.emit('order', order);
        $scope.hasOrdered = true;
    };

    pSocket.emit('init');
});
