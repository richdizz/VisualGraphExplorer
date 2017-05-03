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
            scopes: [ "user.read.all", "calendars.read.shared", "contacts.read.shared", "files.read.all", "mail.read", "group.read.all", "notes.read", "sites.read.all" ],
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
        vgeService.photo = function(id, type, node) {
            var deferred = $q.defer();
        
            vgeService.kurve.getAccessTokenForScopesAsync(appConfig.scopes).then(function(token) {
                $http.get("https://graph.microsoft.com/v1.0/" + type + "/" + id + "/photo/$value", { headers:  { "Authorization": "Bearer " + token }, responseType: "blob" }).then(function (image) {
                    // Convert blob into image that app can display
                    var imgUrl = window.URL || window.webkitURL;
                    var blobUrl = imgUrl.createObjectURL(image.data);
                    deferred.resolve({ pic: blobUrl, node: node });
                }, function (err) {
                    deferred.reject(err);
                });
            }, function(err) {
                deferred.reject(err);
            });
        
            return deferred.promise;
        };

        // photo from URL
        vgeService.photoFromUrl = function(url) {
            var deferred = $q.defer();
        
            vgeService.kurve.getAccessTokenForScopesAsync(appConfig.scopes).then(function(token) {
                $http.get(url, { headers:  { "Authorization": "Bearer " + token }, responseType: "blob" }).then(function (image) {
                    // Convert blob into image that app can display
                    var imgUrl = window.URL || window.webkitURL;
                    var blobUrl = imgUrl.createObjectURL(image.data);
                    deferred.resolve({ pic: blobUrl, node: node });
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

        // groups
        vgeService.groups = function(id) {
            var deferred = $q.defer();
        
            vgeService.kurve.getAccessTokenForScopesAsync(appConfig.scopes).then(function(token) {
                $http.get("https://graph.microsoft.com/beta/users/" + id + "/memberOf/$/microsoft.graph.group?$filter=groupTypes/any(a:a%20eq%20'unified')", { headers:  { "Authorization": "Bearer " + token } }).then(function(result) {
                    deferred.resolve(result.data);
                }, function (err) {
                    deferred.reject(err);
                });
            }, function(err) {
                deferred.reject(err);
            });
        
            return deferred.promise;
        };

        // files
        vgeService.files = function(id) {
            var deferred = $q.defer();
        
            vgeService.kurve.getAccessTokenForScopesAsync(appConfig.scopes).then(function(token) {
                $http.get("https://graph.microsoft.com/beta/users/" + id + "/drive/root/children", { headers:  { "Authorization": "Bearer " + token } }).then(function(result) {
                    deferred.resolve(result.data);
                }, function (err) {
                    deferred.reject(err);
                });
            }, function(err) {
                deferred.reject(err);
            });
        
            return deferred.promise;
        };

        // thumbnail
        vgeService.thumbnail = function(userid, fileid, node) {
            var deferred = $q.defer();
        
            vgeService.kurve.getAccessTokenForScopesAsync(appConfig.scopes).then(function(token) {
                $http.get("https://graph.microsoft.com/beta/users/" + userid + "/drive/items/" + fileid + "/thumbnails", { headers:  { "Authorization": "Bearer " + token } }).then(function(result) {
                    if (result.data.value.length > 0)
                        deferred.resolve({ pic: result.data.value[0].small.url, node: node });
                    else
                        deferred.resolve({ pic: "", node: node });
                }, function (err) {
                    deferred.reject(err);
                });
            }, function(err) {
                deferred.reject(err);
            });
        
            return deferred.promise;
        };

        // trending
        vgeService.trending = function(id) {
            var deferred = $q.defer();
        
            vgeService.kurve.getAccessTokenForScopesAsync(appConfig.scopes).then(function(token) {
                $http.get("https://graph.microsoft.com/beta/users/" + id + "/insights/trending", { headers:  { "Authorization": "Bearer " + token } }).then(function(result) {
                    deferred.resolve(result.data);
                }, function (err) {
                    deferred.reject(err);
                });
            }, function(err) {
                deferred.reject(err);
            });
        
            return deferred.promise;
        };

        // directs
        vgeService.directs = function(id) {
            var deferred = $q.defer();
        
            vgeService.kurve.getAccessTokenForScopesAsync(appConfig.scopes).then(function(token) {
                $http.get("https://graph.microsoft.com/beta/users/" + id + "/directReports", { headers:  { "Authorization": "Bearer " + token } }).then(function(result) {
                    deferred.resolve(result.data);
                }, function (err) {
                    deferred.reject(err);
                });
            }, function(err) {
                deferred.reject(err);
            });
        
            return deferred.promise;
        };

        // manager
        vgeService.manager = function(id) {
            var deferred = $q.defer();
        
            vgeService.kurve.getAccessTokenForScopesAsync(appConfig.scopes).then(function(token) {
                $http.get("https://graph.microsoft.com/beta/users/" + id + "/manager", { headers:  { "Authorization": "Bearer " + token } }).then(function(result) {
                    deferred.resolve(result.data);
                }, function (err) {
                    deferred.reject(err);
                });
            }, function(err) {
                deferred.reject(err);
            });
        
            return deferred.promise;
        };

        // messages
        vgeService.messagesNextLink = 0;
        vgeService.messages = function(id) {
            var deferred = $q.defer();
        
            vgeService.kurve.getAccessTokenForScopesAsync(appConfig.scopes).then(function(token) {
                $http.get("https://graph.microsoft.com/beta/users/" + id + "/messages", { headers:  { "Authorization": "Bearer " + token } }).then(function(result) {
                    // if a next link is present, store it so that we can
                    // get more data
                    vgeService.messagesNextLink = result.data['@odata.nextLink'];
                    deferred.resolve(result.data);
                }, function (err) {
                    deferred.reject(err);
                });
            }, function(err) {
                deferred.reject(err);
            });
        
            return deferred.promise;
        };

        // events
        vgeService.eventsNextLink = 0;
        vgeService.events = function(id) {
            var deferred = $q.defer();
        
            vgeService.kurve.getAccessTokenForScopesAsync(appConfig.scopes).then(function(token) {
                $http.get("https://graph.microsoft.com/beta/users/" + id + "/events", { headers:  { "Authorization": "Bearer " + token } }).then(function(result) {
                    // if a next link is present, store it so that we can
                    // get more data
                    vgeService.eventsNextLink = result.data['@odata.nextLink'];
                    deferred.resolve(result.data);
                }, function (err) {
                    deferred.reject(err);
                });
            }, function(err) {
                deferred.reject(err);
            });
        
            return deferred.promise;
        };

        // contacts
        vgeService.contactsNextLink = 0;
        vgeService.contacts = function(id) {
            var deferred = $q.defer();
        
            vgeService.kurve.getAccessTokenForScopesAsync(appConfig.scopes).then(function(token) {
                $http.get("https://graph.microsoft.com/beta/users/" + id + "/contacts", { headers:  { "Authorization": "Bearer " + token } }).then(function(result) {
                    // if a next link is present, store it so that we can
                    // get more data
                    vgeService.contactsNextLink = result.data['@odata.nextLink'];
                    deferred.resolve(result.data);
                }, function (err) {
                    deferred.reject(err);
                });
            }, function(err) {
                deferred.reject(err);
            });
        
            return deferred.promise;
        };

        // notes
        vgeService.notesNextLink = 0;
        vgeService.notes = function(id) {
            var deferred = $q.defer();
        
            vgeService.kurve.getAccessTokenForScopesAsync(appConfig.scopes).then(function(token) {
                $http.get("https://graph.microsoft.com/beta/users/" + id + "/notes/notebooks", { headers:  { "Authorization": "Bearer " + token } }).then(function(result) {
                    // if a next link is present, store it so that we can
                    // get more data
                    vgeService.notesNextLink = result.data['@odata.nextLink'];
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