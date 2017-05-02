(function() {
    angular.module("vge.services", [])
    .factory("vgeService", ["$rootScope", "$http", "$q", "$rootScope", function($rootScope, $http, $q, $rootScope) {
        var vgeService = {};

        // wait function to toggle spinner
        vgeService.wait = function(show) {
            $rootScope.$broadcast("wait", show);
        };

        var appConfig = {
            clientID: "a6745379-072d-4656-9247-9b4f69982b17",
            scopes: ["user.read", "mail.send"],
            redirectUri: "http://localhost:3474/node_modules/kurvejs/dist/login.html",
            authority: "https://login.microsoftonline.com/common"
        };
        vgeService.kurve = new Kurve.Identity(appConfig.clientID, appConfig.redirectUri, { endpointVersion: Kurve.EndpointVersion.v2 });

        // signIn function for performing the sign-in to AAD with KurveJS
        vgeService.signIn = function() {
            var deferred = $q.defer();

            vgeService.kurve.loginAsync({ scopes: appConfig.scopes }).then(function() {
                deferred.resolve(true);
            }, function(err) {
                deferred.reject(err);
            });

            return deferred.promise;
        };

        // me
        vgeService.me = function() {
            var deferred = $q.defer();

            vgeService.kurve.getAccessTokenForScopesAsync(appConfig.scopes).then(function(token) {
                $http.get("https://graph.microsoft.com/v1.0/me", { headers:  { "Authorization": "Bearer " + token } }).then(function(result) {
                    deferred.resolve(result.data);
                }, function (err) {
                    deferred.reject(err);
                });
            }, function(err) {
                deferred.reject(err);
            });

            return deferred.promise;
        };

        // photo
        vgeService.photo = function(id) {
            var deferred = $q.defer();
        
            vgeService.kurve.getAccessTokenForScopesAsync(appConfig.scopes).then(function(token) {
                $http.get("https://graph.microsoft.com/v1.0/users/" + id + "/photo/$value", { headers:  { "Authorization": "Bearer " + token }, responseType: "blob" }).then(function (image) {
                    // Convert blob into image that app can display
                    var imgUrl = window.URL || window.webkitURL;
                    var blobUrl = imgUrl.createObjectURL(image.data);
                    deferred.resolve(blobUrl);
                }, function (err) {
                    deferred.reject(err);
                });
            }, function(err) {
                deferred.reject(err);
            });
        
            return deferred.promise;
        };

        // people
        vgeService.people = function(id) {
            var deferred = $q.defer();
        
            vgeService.kurve.getAccessTokenForScopesAsync(appConfig.scopes).then(function(token) {
                $http.get("https://graph.microsoft.com/beta/users/" + id + "/people", { headers:  { "Authorization": "Bearer " + token } }).then(function(result) {
                    deferred.resolve(result.data);
                }, function (err) {
                    deferred.reject(err);
                });
            }, function(err) {
                deferred.reject(err);
            });
        
            return deferred.promise;
        };

        return vgeService;
    }]);
})();