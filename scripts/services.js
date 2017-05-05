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

        // initial people
        vgeService.people = function(id) {
            return vgeService.getPeople("https://graph.microsoft.com/beta/users/" + id + "/people?$filter=personType%20eq%20'Person'");
        };

        // next people
        vgeService.nextPeople = function() {
            if (vgeService.peopleNextLink == null) {
                return;
            }
            return vgeService.getPeople(vgeService.peopleNextLink);
        };

        // get people
        vgeService.peopleNextLink = null;
        vgeService.getPeople = function(url) {
            var deferred = $q.defer();
        
            vgeService.kurve.getAccessTokenForScopesAsync(appConfig.scopes).then(function(token) {
                $http.get(url, { headers:  { "Authorization": "Bearer " + token } }).then(function(result) {
                    vgeService.peopleNextLink = null;
                    deferred.resolve(result.data);
                }, function (err) {
                    deferred.reject(err);
                });
            }, function(err) {
                deferred.reject(err);
            });
        
            return deferred.promise;
        };

        // members
        vgeService.members = function(id) {
            var deferred = $q.defer();
        
            vgeService.kurve.getAccessTokenForScopesAsync(appConfig.scopes).then(function(token) {
                $http.get("https://graph.microsoft.com/beta/groups/" + id + "/members", { headers:  { "Authorization": "Bearer " + token } }).then(function(result) {
                    deferred.resolve(result.data);
                }, function (err) {
                    deferred.reject(err);
                });
            }, function(err) {
                deferred.reject(err);
            });
        
            return deferred.promise;
        };

        // initial groups
        vgeService.groups = function(id) {
            return vgeService.getGroups("https://graph.microsoft.com/beta/users/" + id + "/memberOf/$/microsoft.graph.group?$filter=groupTypes/any(a:a%20eq%20'unified')");
        };

        // next groups
        vgeService.nextGroups = function() {
            if (vgeService.groupsNextLink == null) {
                return;
            }
            return vgeService.getGroups(vgeService.groupsNextLink);
        };

        // get groups
        vgeService.groupsNextLink = null;
        vgeService.getGroups = function(url) {
            var deferred = $q.defer();
        
            vgeService.kurve.getAccessTokenForScopesAsync(appConfig.scopes).then(function(token) {
                $http.get(url, { headers:  { "Authorization": "Bearer " + token } }).then(function(result) {
                    // TODO: fix paging for groups?
                    vgeService.groupsNextLink = null;
                    deferred.resolve(result.data);
                }, function (err) {
                    deferred.reject(err);
                });
            }, function(err) {
                deferred.reject(err);
            });
        
            return deferred.promise;
        };

        // initial files
        vgeService.files = function(id) {
            return vgeService.getFiles("https://graph.microsoft.com/beta/users/" + id + "/drive/root/children");
        };

        // next files
        vgeService.nextFiles = function() {
            if (vgeService.filesNextLink == null) {
                return;
            }
            return vgeService.getFiles(vgeService.filesNextLink);
        };

        // get files
        vgeService.filesNextLink = null;
        vgeService.getFiles = function(url) {
            var deferred = $q.defer();
        
            vgeService.kurve.getAccessTokenForScopesAsync(appConfig.scopes).then(function(token) {
                $http.get(url, { headers:  { "Authorization": "Bearer " + token } }).then(function(result) {
                    // TODO: fix paging for groups?
                    vgeService.filesNextLink = null;
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
        vgeService.thumbnail = function(userid, path, node) {
            var deferred = $q.defer();
        
            vgeService.kurve.getAccessTokenForScopesAsync(appConfig.scopes).then(function(token) {
                $http.get("https://graph.microsoft.com/beta/users/" + userid + "/" + path, { headers:  { "Authorization": "Bearer " + token } }).then(function(result) {
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

        // initial messages
        vgeService.messages = function(id) {
            return vgeService.getMessages("https://graph.microsoft.com/beta/users/" + id + "/messages");
        };

        // next messages
        vgeService.nextMessages = function() {
            if (vgeService.messagesNextLink == null) {
                return;
            }
            return vgeService.getMessages(vgeService.messagesNextLink);
        };

        // get messages
        vgeService.messagesNextLink = null;
        vgeService.getMessages = function(url) {
            var deferred = $q.defer();
        
            vgeService.kurve.getAccessTokenForScopesAsync(appConfig.scopes).then(function(token) {
                $http.get(url, { headers:  { "Authorization": "Bearer " + token } }).then(function(result) {
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

        // initial events
        vgeService.events = function(id) {
            return vgeService.getEvents("https://graph.microsoft.com/beta/users/" + id + "/events");
        };

        // next events
        vgeService.nextEvents = function() {
            if (vgeService.eventsNextLink == null) {
                return;
            }
            return vgeService.getEvents(vgeService.eventsNextLink);
        };

        // get events
        vgeService.eventsNextLink = null;
        vgeService.getEvents = function(url) {
            var deferred = $q.defer();
        
            vgeService.kurve.getAccessTokenForScopesAsync(appConfig.scopes).then(function(token) {
                $http.get(url, { headers:  { "Authorization": "Bearer " + token } }).then(function(result) {
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

        // initial contacts
        vgeService.contacts = function(id) {
            return vgeService.getContacts("https://graph.microsoft.com/beta/users/" + id + "/contacts");
        };

        // next contacts
        vgeService.nextContacts = function() {
            if (vgeService.contactsNextLink == null) {
                return;
            }
            return vgeService.getContacts(vgeService.contactsNextLink);
        };

        // get contacts
        vgeService.contactsNextLink = null;
        vgeService.getContacts = function(url) {
            var deferred = $q.defer();
        
            vgeService.kurve.getAccessTokenForScopesAsync(appConfig.scopes).then(function(token) {
                $http.get(url, { headers:  { "Authorization": "Bearer " + token } }).then(function(result) {
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

        // initial notes
        vgeService.notes = function(id) {
            return vgeService.getNotes("https://graph.microsoft.com/beta/users/" + id + "/notes/notebooks");
        };

        // next notes
        vgeService.nextNotes = function() {
            if (vgeService.notesNextLink == null) {
                return;
            }
            return vgeService.getNotes(vgeService.notesNextLink);
        };

        // get notes
        vgeService.notesNextLink = null;
        vgeService.getNotes = function(url) {
            var deferred = $q.defer();
        
            vgeService.kurve.getAccessTokenForScopesAsync(appConfig.scopes).then(function(token) {
                $http.get(url, { headers:  { "Authorization": "Bearer " + token } }).then(function(result) {
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

        // initial plans
        vgeService.plans = function(id) {
            return vgeService.getPlans("https://graph.microsoft.com/beta/users/" + id + "/planner/plans");
        };

        // next plans
        vgeService.nextPlans = function() {
            if (vgeService.plansNextLink == null) {
                return;
            }
            return vgeService.getPlans(vgeService.plansNextLink);
        };

        // get plans
        vgeService.plansNextLink = null;
        vgeService.getPlans = function(url) {
            var deferred = $q.defer();
        
            vgeService.kurve.getAccessTokenForScopesAsync(appConfig.scopes).then(function(token) {
                $http.get(url, { headers:  { "Authorization": "Bearer " + token } }).then(function(result) {
                    // if a next link is present, store it so that we can
                    // get more data
                    vgeService.plansNextLink = result.data['@odata.nextLink'];
                    deferred.resolve(result.data);
                }, function (err) {
                    deferred.reject(err);
                });
            }, function(err) {
                deferred.reject(err);
            });
        
            return deferred.promise;
        };

        // resets the next links
        vgeService.resetNextLinks = function() {
            vgeService.peopleNextLink = null;
            vgeService.groupsNextLink = null;
            vgeService.filesNextLink = null;
            vgeService.messagesNextLink = null;
            vgeService.eventsNextLink = null;
            vgeService.contactsNextLink = null;
            vgeService.notesNextLink = null;
        };

        return vgeService;
    }]);
})();