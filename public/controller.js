const pizzaApp = angular.module("pizzaApp", ['dyFlipClock', 'btford.socket-io']);
pizzaApp.factory('pSocket', function (socketFactory) {
    return socketFactory();
});
pizzaApp.controller("PizzaCtrl", function($scope, $interval, pSocket) {
    $interval(() => {
        // if (countdownUntil > 0) {
        //     $scope.remainingTime = Math.max(countdownUntil - Date.now(), 0);
        // }
    }, 1000);

    $scope.sendUpdate = user => {

    };

    $scope.joinOrder = user => {
        user.joined = true;
        pSocket.emit('join', user);
    };

    $scope.leaveOrder = user => {
        user.joined = false;
        pSocket.emit('leave', user);
    };

    $scope.addUser = user => {
        pSocket.emit('newUser', $scope.newPerson);
    };

    $scope.addGarlicKnots = user => {

    };

    $scope.newPerson = {
        name: ''
    };

user.garlicKnots
user.joined
removeUser(user)
});
