const pizzaApp = angular.module("pizzaApp", ['btford.socket-io']);
pizzaApp.factory('pSocket', function (socketFactory) {
    return socketFactory();
});
pizzaApp.controller("PizzaCtrl", function($scope, $interval, pSocket) {
    $scope.newPerson = {};
    $scope.users = new window.Users();

    $scope.users.configureSocket(pSocket);

    //$interval(() => {
        // if (countdownUntil > 0) {
        //     $scope.remainingTime = Math.max(countdownUntil - Date.now(), 0);
        // }
    //}, 1000);


    //#region InitReset

    pSocket.on('init', $scope.users.init);
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
            joined: false,
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
