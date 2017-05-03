(function() {
    angular.module("vge.app", ["vge.services", "vge.controllers", "uiSwitch", "ngRoute"])
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
    }]);
})();