(function() {
    angular.module("vge.app", ["vge.services", "vge.controllers", "uiSwitch", "jsonFormatter", "ngRoute"])
    .config(["$routeProvider", function($routeProvider) {
        $routeProvider.when("/visual", {
            controller: "visualCtrl",
            templateUrl: "templates/view-visual.html"
        }).when("/login", {
            controller: "loginCtrl",
            templateUrl: "templates/view-login.html"
        }).otherwise({
            redirectTo: "/visual"
        });
    }])
    .filter('nodeFilters', function () {
        return function (filters, type) {
            var items = [];
            angular.forEach(filters, function (value, key) {
                if (value.types.indexOf(type) != -1 && value.enabled) {
                    items.push(value);
                }
            }, items);
            return items;
        };
    });
})();