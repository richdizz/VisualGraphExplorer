(function() {
    angular.module("vge.controllers", [])
    .controller("appCtrl", ["$scope", function($scope) {
        // private variables
        var waitDialog = null;
        var spinner = null;

        // scope variables
        $scope.showSpinner = false;

        // listen spinner toggles
        $scope.$on("wait", function (evt, val) {
            $scope.showSpinner = val;

            // initialize the wait dialog if needed
            if (waitDialog == null) {
                // initialize dialog
                var waitDialogElement = document.querySelector("#wait-dialog");
                waitDialog = new fabric['Dialog'](waitDialogElement);
                waitDialog.open();

                // initialize spinners
                var spinnerElement = document.querySelector(".ms-Spinner");
                spinner = new fabric['Spinner'](spinnerElement);
            }

            if (val) {
                spinner.start();
            }
            else {
                spinner.stop();
            }
        });
    }])
    .controller("loginCtrl", ["$scope", "$location", "vgeService", function($scope, $location, vgeService) {
        if (vgeService.kurve.isLoggedIn())
            $location.path("/visual");
        else {
            // show the login prompt
            var dialog = document.querySelector("#login-dialog");
            var dialogComponent = new fabric['Dialog'](dialog);
            dialogComponent.open();

            // login function for signing user in and redirecting to visual
            $scope.login = function() {
                vgeService.signIn().then(function() {
                    $location.path("/visual");
                }, function (err) {
                    alert(err);
                });
            };
        }
    }])
    .controller("visualCtrl", ["$scope", "$location", "vgeService", '$timeout', function($scope, $location, vgeService, $timeout) {
        if (!vgeService.kurve.idToken)
            $location.path("/login");
        else {
            // scope variables
            $scope.isMSA = (vgeService.kurve.idToken.TenantId == "9188040d-6c67-4c5b-b112-36a304b66dad"); //NOT SURE OF LOGIC HERE
            $scope.json = {};
            $scope.type = "me";
            $scope.canGoBack = false;
            $scope.navStack = [];
            $scope.typeColors = [
                { type: "me", text: "Me", color: "#e81224", show: true, enabled: false, pic: "/images/01me.png", more: false, types: ["me"], defaultExpands: ["me", "people"] },
                { type: "groups", text: "Groups", color: "#f7630c", show: false, enabled: true, pic: "/images/02groups.png", more: false, types: ["me", "people", "members"], defaultExpands: ["members"] },
                { type: "people", text: "People", color: "#ffb900", show: false, enabled: true, pic: "/images/03people.png", more: false, types: ["me", "people", "members"], defaultExpands: ["people"] },
                { type: "members", text: "Members", color: "#ffb900", show: true, enabled: true, pic: "/images/03people.png", more: false, types: ["groups"], defaultExpands: ["people"] },
                { type: "directs", text: "Direct reports", color: "#fce100", show: false, enabled: true, pic: "/images/04directs.png", more: false, types: ["me", "people", "members"], defaultExpands: ["people"] },
                { type: "manager", text: "Manager", color: "#bad80a", show: false, enabled: true, pic: "/images/05manager.png", more: false, types: ["me", "people", "members"], defaultExpands: ["people"] },
                { type: "files", text: "Files", color: "#16c60c", show: false, enabled: true, pic: "/images/06files.png", more: false, types: ["me", "groups", "people", "members"], defaultExpands: ["createdBy", "modifiedBy"] },
                { type: "trending", text: "Trending", color: "#00b7c3", show: false, enabled: true, pic: "/images/07trending.png", more: false, types: ["me", "people", "members"], defaultExpands: ["createdBy", "modifiedBy"] },
                { type: "messages", text: "Messages", color: "#0078d7", show: false, enabled: true, pic: "/images/08messages.png", more: false, types: ["me", "people", "members"], defaultExpands: ["from", "to", "cc", "bcc"] },
                { type: "conversations", text: "Conversations", color: "#0078d7", show: false, enabled: true, pic: "/images/08conversations.png", more: false, types: ["groups"], defaultExpands: [] },
                { type: "events", text: "Events", color: "#4f4bd9", show: false, enabled: true, pic: "/images/09events.png", more: false, types: ["me", "people", "members"], defaultExpands: ["organizer", "attendees"] },
                { type: "contacts", text: "Contacts", color: "#744da9", show: false, enabled: true, pic: "/images/10contacts.png", more: false, types: ["me", "people", "members"], defaultExpands: [] },
                { type: "notes", text: "Notes", color: "#881798", show: false, enabled: true, pic: "/images/11notes.png", more: false, types: ["me", "people", "members"], defaultExpands: [] },
                { type: "plans", text: "Plans", color: "#e3008c", show: false, enabled: true, pic: "/images/12plans.png", more: false, types: ["me", "people", "members"], defaultExpands: [] },
                

                
                ///these need colors, pics, etc
                { type: "createdBy", text: "Created By", color: "#e81224", show: false, enabled: true, pic: "/images/80createdby.png", more: false, types: ["files", "trending"], defaultExpands: [] },
                { type: "modifiedBy", text: "Modified By", color: "#ffb900", show: false, enabled: true, pic: "/images/81modifiedby.png", more: false, types: ["files", "trending"], defaultExpands: [] },
                { type: "from", text: "From", color: "#e81224", show: false, enabled: true, pic: "/images/82from.png", more: false, types: ["messages"], defaultExpands: [] },
                { type: "to", text: "To", color: "#ffb900", show: false, enabled: true, pic: "/images/83to.png", more: false, types: ["messages"], defaultExpands: [] },
                { type: "cc", text: "CC", color: "#bad80a", show: false, enabled: true, pic: "/images/84cc.png", more: false, types: ["messages"], defaultExpands: [] },
                { type: "bcc", text: "BCC", color: "#881798", show: false, enabled: true, pic: "/images/85bcc.png", more: false, types: ["messages"], defaultExpands: [] },
                { type: "organizer", text: "Organizer", color: "#e81224", show: false, enabled: true, pic: "/images/86organizer.png", more: false, types: ["events"], defaultExpands: [] },
                { type: "attendees", text: "Attendees", color: "#ffb900", show: false, enabled: true, pic: "/images/87attendees.png", more: false, types: ["events"], defaultExpands: [] }
            ];
            $scope.showDetails = true;
            $scope.showFilters = false;
            var deadendTypes = ["contacts", "from", "to", "cc", "bcc", "organizer", "attendees"];

            // toggle the menu
            $scope.toggleMenu = function(option) {
                $scope.showDetails = (option == "details");
                $scope.showFilters = (option == "filters");
            };

            // get more data on paged results
            $scope.toggleMore = function(filterItem) {
                // start the spinner
                vgeService.wait(true);

                switch (filterItem.type) {
                    case 'people': 
                        // query for groups
                        vgeService.nextPeople().then(function(peopleResult) {
                            addNodes('people', peopleResult);
                            setLoaded('people');
                        });
                    break;
                    case 'groups': 
                        // query for groups
                        vgeService.nextGroup().then(function(groupResult) {
                            addNodes('groups', groupResult);
                            setLoaded('groups');
                        });
                    break;
                    case 'files': 
                        // query for files
                        vgeService.nextFiles().then(function(fileResult) {
                            addNodes('files', fileResult);
                            setLoaded('files');
                        });
                    break;
                    case 'messages': 
                        // query for messages
                        vgeService.nextMessages().then(function(messageResult) {
                            addNodes('messages', messageResult);
                            setLoaded('messages');
                        });
                    break;
                    case 'events': 
                        // query for events
                        vgeService.nextEvents().then(function(eventResult) {
                            addNodes('events', eventResult);
                            setLoaded('events');
                        });
                    break;
                    case 'contacts': 
                        // query for contacts
                        vgeService.nextContacts().then(function(contactResult) {
                            addNodes('contacts', contactResult);
                            setLoaded('contacts');
                        });
                    break;
                    case 'notes': 
                        // query for notes
                        vgeService.nextNotes().then(function(noteResult) {
                            addNodes('notes', noteResult);
                            setLoaded('notes');
                        });
                    break;
                }
            };

            // show or hide data via filters
            $scope.toggleFilter = function(filterItem) {
                // start the spinner
                vgeService.wait(true);

                // check which way to toggle the display
                if (!filterItem.show) {
                    // this type is already loaded but we want to hide them now
                    for (var i = 0; i < currentData.children.length; i++) {
                        if (currentData.children[i].type == filterItem.type)
                            currentData.children[i].hide = true;
                    }

                    // update the 'get more' label
                    setMore(filterItem.type, false);

                    // update the visual and stop spinner
                    updateVisual(currentData);
                    vgeService.wait(false);
                }
                else {
                    // first check to see if loaded
                    if (currentData.loadStatus[filterItem.type]) {
                        // already loaded...loop through and toggle to show
                        for (var i = 0; i < currentData.children.length; i++) {
                            if (currentData.children[i].type == filterItem.type)
                                currentData.children[i].hide = false;
                        }

                        // update the visual and stop spinner
                        updateVisual(currentData);
                        vgeService.wait(false);
                    }
                    else {
                        // need to load and then mark loaded
                        switch (filterItem.type) {
                            case "me":
                                setLoaded('me');
                                break;
                            case "groups":
                                // query for groups
                                vgeService.groups(currentData.objid).then(function(groupResults) {
                                    addNodes('groups', groupResults);
                                    setLoaded('groups');
                                }, function () {
                                    vgeService.wait(false);
                                });
                                break;
                            case "people":
                                // query for people
                                vgeService.people(currentData.objid).then(function(peopleResults) {
                                    addNodes('people', peopleResults);
                                    setLoaded('people');
                                }, function () {
                                    vgeService.wait(false);
                                });
                                break;
                            case "members":
                                // query for members
                                vgeService.members(currentData.objid).then(function(memberResult) {
                                    addNodes('members', memberResult);
                                    setLoaded('members');
                                }, function () {
                                    vgeService.wait(false);
                                });
                                break;
                            case "directs":
                                // query for directs
                                vgeService.directs(currentData.objid).then(function(directResult) {
                                    addNodes('directs', directResult);
                                    setLoaded('directs');
                                }, function () {
                                    vgeService.wait(false);
                                });
                                break;
                            case "manager":
                                // query for manager
                                vgeService.manager(currentData.objid).then(function(managerResult) {
                                    addNodes('manager', managerResult);
                                    setLoaded('manager');
                                }, function () {
                                    vgeService.wait(false);
                                }, function () {
                                    vgeService.wait(false);
                                });
                                break;
                            case "files":
                                // query for files
                                var collection = currentData.type == 'me' ? 'users' : currentData.type; 
                                vgeService.files(collection, currentData.objid).then(function(fileResults) {
                                    addNodes('files', fileResults);
                                    setLoaded('files');
                                }, function () {
                                    vgeService.wait(false);
                                });
                                break;
                            case "trending":
                                // query for trending
                                vgeService.trending(($scope.selectedNode || currentData).objid).then(function(trendingResult) {
                                    addNodes('trending', trendingResult);
                                    setLoaded('trending');
                                }, function () {
                                    vgeService.wait(false);
                                });
                                break;
                            case "messages":
                                // query for messages
                                vgeService.messages(currentData.objid).then(function(messageResult) {
                                    addNodes('messages', messageResult);
                                    setLoaded('messages');
                                }, function () {
                                    vgeService.wait(false);
                                });
                                break;
                            case "conversations":
                                // query for messages
                                vgeService.conversations(currentData.objid).then(function(conversationResult) {
                                    addNodes('conversations', conversationResult);
                                    setLoaded('conversations');
                                }, function () {
                                    vgeService.wait(false);
                                });
                                break;
                            case "events":
                                // query for events
                                vgeService.events(currentData.objid).then(function(eventResult) {
                                    addNodes('events', eventResult);
                                    setLoaded('events');
                                }, function () {
                                    vgeService.wait(false);
                                });
                                break;
                            case "contacts":
                                // query for contacts
                                vgeService.contacts(currentData.objid).then(function(contactResult) {
                                    addNodes('contacts', contactResult);
                                    setLoaded('contacts');
                                }, function () {
                                    vgeService.wait(false);
                                });
                                break;
                            case "notes":
                                // query for notes
                                vgeService.notes(currentData.objid).then(function(noteResult) {
                                    addNodes('notes', noteResult);
                                    setLoaded('notes');
                                }, function () {
                                    vgeService.wait(false);
                                });
                                break;
                            case "plans":
                                // TODO: query for plans
                                alert("TODO");
                                break;
                            case "createdBy":
                                // query for createdBy
                                vgeService.getUser(currentData.obj.createdBy.user.id).then(function(createdByResult) {
                                    var newNode = createNode(createdByResult.id, createdByResult.name, 'createdBy', '/images/80createdby.png', createdByResult);
                                    currentData.children.push(newNode);
                                    setLoaded('createdBy');

                                    // get the photo for the user
                                    vgeService.photo(newNode.objid, "users", newNode).then(function(photoResults) {
                                        setNodeImage(photoResults);
                                    }, function(err) {  });
                                }, function () {
                                    vgeService.wait(false);
                                });
                                break;
                            case "modifiedBy":
                                // query for modifiedBy
                                vgeService.getUser(currentData.obj.lastModifiedBy.user.id).then(function(modifiedByResult) {
                                    var newNode = createNode(modifiedByResult.id, modifiedByResult.name, 'modifiedBy', '/images/81modifiedby.png', modifiedByResult);
                                    currentData.children.push(newNode);
                                    setLoaded('modifiedBy');

                                    // get the photo for the user
                                    vgeService.photo(newNode.objid, "users", newNode).then(function(photoResults) {
                                        setNodeImage(photoResults);
                                    }, function(err) {  });
                                }, function () {
                                    vgeService.wait(false);
                                });
                                break;
                            case "from":
                                // populate "from" using sender of email
                                if (currentData.obj.sender)
                                    currentData.children.push(createNode(currentData.obj.sender.emailAddress.address, currentData.obj.sender.emailAddress.address, 'from', '/images/82from.png', currentData.obj.sender));
                                setLoaded('from');
                                break;
                            case "to":
                                // populate "to" using toRecipients of email
                                for (var i = 0; i < currentData.obj.toRecipients.length; i++)
                                    currentData.children.push(createNode(currentData.obj.toRecipients[i].emailAddress.address, currentData.obj.toRecipients[i].emailAddress.address, 'to', '/images/83to.png', currentData.obj.toRecipients[i]));
                                setLoaded('to');
                                break;
                            case "cc":
                                // populate "cc" using toRecipients of email
                                for (var i = 0; i < currentData.obj.ccRecipients.length; i++)
                                    currentData.children.push(createNode(currentData.obj.ccRecipients[i].emailAddress.address, currentData.obj.ccRecipients[i].emailAddress.address, 'cc', '/images/84cc.png', currentData.obj.ccRecipients[i]));
                                setLoaded('cc');
                                break;
                            case "bcc":
                                // populate "bcc" using toRecipients of email
                                for (var i = 0; i < currentData.obj.bccRecipients.length; i++)
                                    currentData.children.push(createNode(currentData.obj.bccRecipients[i].emailAddress.address, currentData.obj.bccRecipients[i].emailAddress.address, 'bcc', '/images/85bcc.png', currentData.obj.bccRecipients[i]));
                                setLoaded('bcc');
                                break;
                            case "organizer":
                                // query for organizer
                                if (currentData.obj.organizer)
                                    currentData.children.push(createNode(currentData.obj.organizer.emailAddress.address, currentData.obj.organizer.emailAddress.address, 'organizer', '/images/86organizer.png', currentData.obj.organizer));
                                setLoaded('organizer');
                                break;
                            case "attendees":
                                // query for attendees
                                for (var i = 0; i < currentData.obj.attendees.length; i++)
                                    currentData.children.push(createNode(currentData.obj.attendees[i].emailAddress.address, currentData.obj.attendees[i].emailAddress.address, 'attendees', '/images/87attendees.png', currentData.obj.attendees[i]));
                                setLoaded('attendees');
                                break;
                        }
                    }
                }
            };

            // initialize visualization
            $scope.reset = function () {
                vgeService.wait(true);
                vgeService.me().then(function(meResults) {
                    var newNode = createNode(meResults.id, meResults.displayName, 'me', '/images/01me.png', meResults);
                    setRootNode(newNode, false);

                    // get photo for the user
                    vgeService.photo(meResults.id, "users", newNode).then(function(photoResults) {
                        setNodeImage(photoResults);
                    }, function(err) {  });
                });
            }

            // shows the GitHub repository
            $scope.toggleInfo = function () {
                window.open('https://github.com/richdizz/VisualGraphExplorer');
            }

            // go back
            $scope.back = function() {
                var obj = $scope.navStack[$scope.navStack.length - 1];
                setRootNode(obj, true);
                $scope.navStack.pop();
                $scope.canGoBack = ($scope.navStack.length > 0);
            };

            // get a filter
            var getFilter = function(type) {
                for (var i = 0; i < $scope.typeColors.length; i++) {
                    if ($scope.typeColors[i].type === type)
                        return $scope.typeColors[i];
                }
            };

            // get color based on the node type
            var getColor = function(type) {
                var filter = getFilter(type);
                return filter.color;
            };

            // set the more flag
            var setMore = function(type, enabled) {
                for (var i = 0; i < $scope.typeColors.length; i++) {
                    if ($scope.typeColors[i].type == type) {
                        $scope.typeColors[i].more = enabled;
                        return;
                    }
                } 
            };

            // gets cache code to prevent node cache
            var getCacheCode = function () {
                var range = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
                var id = '';
                for (i = 0; i < 8; i++)
                    id += range[parseInt(Math.random() * 36)];
                return id;
            };

            // create a node
            var createNode = function(id, text, type, pic, obj) {
                if (id == null || type == null || obj == null) {
                    throw 'not a node';
                }

                var newNode = { id: id + "_" + type, 
                    objid: id,
                    text: text, 
                    type: type, 
                    pic: pic, 
                    children: [], 
                    code: getCacheCode(),
                    loadStatus: { },
                    hide: false, 
                    obj: obj
                };
                return newNode;
            }

            // add nodes from a response
            var addNodes = function (type, result) {
                if (result == null || result.length == 0) {
                    // update the visual and stop spinner
                    updateVisual(currentData);
                    vgeService.wait(false);
                    
                    console.error('no result');
                    return;
                }

                switch (type) {
                    case 'groups':
                        for (var i = 0; i < result.value.length; i++) {
                            var newNode = createNode(result.value[i].id, result.value[i].name, 'groups', '/images/02groups.png', result.value[i]);
                            currentData.children.push(newNode);

                            // get the photo for the group
                            vgeService.photo(newNode.objid, "groups", newNode).then(function(photoResults) {
                                setNodeImage(photoResults);
                            }, function(err) {  });
                        }

                        // update the 'get more' label
                        setMore('groups', vgeService.groupsNextLink != null);
                    break;
                    case 'people':
                    case 'members':
                        for (var i = 0; i < result.value.length; i++) {
                            if (result.value[i].id == currentData.objid) {
                                continue;
                            }

                            var newNode = createNode(result.value[i].id, result.value[i].name, type, '/images/03people.png', result.value[i]);
                            currentData.children.push(newNode);

                            // get photo for the user
                            vgeService.photo(result.value[i].id, "users", newNode).then(function(photoResults) {
                                setNodeImage(photoResults);
                            }, function(err) {  });
                        }

                        // update the 'get more' label
                        if (type == 'people') {
                            setMore('people', vgeService.peopleNextLink != null);
                        }
                    break;
                    case 'directs': 
                        for (var i = 0; i < result.value.length; i++) {
                            var newNode = createNode(result.value[i].id, result.value[i].name, 'directs', '/images/04directs.png', result.value[i]);
                            currentData.children.push(newNode);

                            // get photo for the user
                            vgeService.photo(result.value[i].id, "users", newNode).then(function(photoResults) {
                                setNodeImage(photoResults);
                            }, function(err) {  });
                        }
                    break;
                    case 'manager':
                        var newNode = createNode(result.id, result.name, 'manager', '/images/05manager.png', result);
                        currentData.children.push(newNode);

                        // get photo for the user
                        vgeService.photo(result.id, "users", newNode).then(function(photoResults) {
                            setNodeImage(photoResults);
                        }, function(err) {  });
                    break;
                    case 'trending':
                        for (var i = 0; i < result.value.length; i++) {
                            var newNode = createNode(result.value[i].id, result.value[i].name, 'trending', '/images/07trending.png', result.value[i]);
                            currentData.children.push(newNode);

                            // get thumbnail if this is a file
                            if (result.value[i].resourceVisualization.previewImageUrl) {
                                var url = result.value[i].resourceVisualization.previewImageUrl;
                                url = url.substring(url.indexOf("/drives")); //remove prefix
                                url = url.substring(0, url.indexOf("thumbnails") + 10); //remove ending
                                url = "https://graph.microsoft.com/beta" + url; //add graph to front
                                vgeService.thumbnailTrending(url, newNode).then(function(photoResults) {
                                    setNodeImage(photoResults);
                                }, function(err) {  });
                            }
                        }
                    break;
                    case 'files':
                        // add the people as children
                        for (var i = 0; i < result.value.length; i++) {
                            var newNode = createNode(result.value[i].id, result.value[i].name, 'files', '/images/06files.png', result.value[i]);
                            currentData.children.push(newNode);

                            // get thumbnail if this is a file
                            if (result.value[i].file) {
                                vgeService.thumbnail(currentData.objid, "drive/items/" + newNode.objid + "/thumbnails", newNode).then(function(photoResults) {
                                    setNodeImage(photoResults);
                                }, function(err) {  });
                            }
                        }

                        // update the 'get more' label
                        setMore('files', vgeService.filesNextLink != null);
                    break;
                    case 'messages': 
                        for (var i = 0; i < result.value.length; i++) {
                            var newNode = createNode(result.value[i].id, result.value[i].name, 'messages', '/images/08messages.png', result.value[i]);
                            currentData.children.push(newNode);
                        }

                        // update the 'get more' label
                        setMore('messages', vgeService.messagesNextLink != null);
                    break;
                    case 'conversations': 
                        for (var i = 0; i < result.value.length; i++) {
                            var newNode = createNode(result.value[i].id, result.value[i].name, 'conversations', '/images/08conversations.png', result.value[i]);
                            currentData.children.push(newNode);
                        }
                    break;
                    case 'events': 
                        for (var i = 0; i < result.value.length; i++) {
                            var newNode = createNode(result.value[i].id, result.value[i].name, 'events', '/images/09events.png', result.value[i]);
                            currentData.children.push(newNode);
                        }

                        // update the 'get more' label
                        setMore('events', vgeService.eventsNextLink != null);
                    break;
                    case 'contacts':
                        for (var i = 0; i < result.value.length; i++) {
                            var newNode = createNode(result.value[i].id, result.value[i].name, 'contacts', '/images/10contacts.png', result.value[i]);
                            currentData.children.push(newNode);
                        }

                        // update the 'get more' label
                        setMore('contacts', vgeService.contactsNextLink != null);
                    break;
                    case 'notes':
                        for (var i = 0; i < result.value.length; i++) {
                            var newNode = createNode(result.value[i].id, result.value[i].name, 'notes', '/images/11notes.png', result.value[i]);
                            currentData.children.push(newNode);
                        }

                        // update the 'get more' label
                        setMore('notes', vgeService.notesNextLink != null);
                    break;
                }
            }

            // set node image
            var setNodeImage = function(picResults) {
                picResults.node.pic = picResults.pic;

                var element = document.getElementById(picResults.node.code);
                if (element != null) {
                    element.children[0].setAttribute("href", picResults.node.pic);
                }

                element = document.getElementById(picResults.node.code + "_c");
                if (element != null) {
                    element.setAttribute("fill", "url(#" + picResults.node.code + ")");
                }
            }

            // computes children accordingly (discarding the hidden ones)
            var computeChildren = function(p) {
                var children = [];
                for (var i = 0; p.children && i < p.children.length; i++) {
                    if (p.children[i].hide) {
                        continue;
                    }
                    children.push(p.children[i]);
                }
                return children;
            }

            // computes links
            var computeLinks = function(nodes) {
                return d3.merge(nodes.map(function(parent) {
                    return computeChildren(parent).map(function(child) {
                        return {source: parent, target: child};
                    });
                }));
            }

            var setLoaded = function(type) {
                if (currentData == null && currentData.loadStatus != null) {
                    return;
                }  
                currentData.loadStatus[type] = true;

                // check if everything is loaded
                var all_loaded = true;

                // loop through all types
                for (var i = 0; i < $scope.typeColors.length; i++) {
                    if ($scope.typeColors[i].types.indexOf(currentData.type) != -1 &&
                        $scope.typeColors[i].show &&
                        !currentData.loadStatus[$scope.typeColors[i].type]) {
                            all_loaded = false;
                            break;
                        }
                }

                if (all_loaded) {
                    updateVisual(currentData);
                    vgeService.wait(false);
                }
            };

            // updateVisual function for refreshing the d3 visual
            var updateVisual = function(data) {     
                //clear all visuals
                visual.selectAll('circle').remove();
                visual.selectAll('pattern').remove();
                visual.selectAll('line').remove();

                //prepare the data and restart the force
                data.fixed = true;
                data.x = width / 2;
                data.px = width / 2;
                data.y = height / 2;
                data.py = height / 2;
                nodes = flatten(data);
                nodes[nodes.length - 1].radius = 30;
                links = computeLinks(nodes);
                
                //restart the force layout and update the links
                force.linkDistance(function(d, i) {
                    //TODO: don't reset this if already set
                    var maxRadius = (((width >= height) ? height : width) / 2.5)
                    return Math.random() * maxRadius + (maxRadius * 0.3);
                }).size([width, height]);

                force.nodes(nodes).links(links).start();
                link = visual.selectAll('line.link').data(links, function(d) {
                    return d.target.id;
                });
                
                //enter new links and remove old links
                link.enter().insert('line', '.node')
                    .attr('class', 'link')
                    .attr('stroke', function(d) { return getColor(d.target.type); })
                    .attr('stroke-width', '2px')
                    .attr('x1', function(d) { return d.source.x; })
                    .attr('y1', function(d) { return d.source.y; })
                    .attr('x2', function(d) { return d.target.x; })
                    .attr('y2', function(d) { return d.target.y; });
                link.exit().remove();
                
                //update the nodes
                node = visual.selectAll('.node')
                    .data(nodes, function(d) {  return d.id; });
                patterns = visual.selectAll('.imgPattern')
                    .data(nodes, function(d) {  return d.id; });
                    
                //add dynamic patterns for photos and remove old
                patterns.enter().append('pattern')
                    .attr('id', function(d) { return d.code; })
                    .attr('class', 'imgPattern')
                    .attr('height', function(d) { return d.radius * 2; })
                    .attr('width', function(d) { return d.radius * 2; })
                    .attr('x', '0')
                    .attr('y', '0').append('image')
                    .attr('height', function(d) { return d.radius * 2; })
                    .attr('width', function(d) { return d.radius * 2; })
                    .attr('x', 0)
                    .attr('y', 0)
                    .attr('xlink:href', function (d) { return d.pic; });
                patterns.exit().remove();
                    
                //add the nodes
                node.enter().append('circle')
                    .attr('id', function(d) { return d.code + '_c'; })
                    .attr('fill', function(d) { return (d.pic != '') ? 'url(#' + d.code + ')' : getColor(d.type); })
                    .attr('r', function(d) { return d.radius; })
                    .attr('stroke', function(d) { return getColor(d.type); })
                    .attr('stroke-width', '2px')
                    .style('cursor', 'default')
                    .attr('class', 'node')
                    .on('click', function (d) {
                        //prevent while dragging
                        if (d3.event.defaultPrevented) return true;

                        // don't allow navigation to a dead node
                        if (deadendTypes.indexOf(d.type) == -1) {
                            var prevNode = cloneNode(currentData);
                            $scope.navStack.push(prevNode);
                            $scope.canGoBack = true;

                            // set this node to the new root node
                            if (currentData.id != d.id) {
                                // special case for trending...we need to convert to a file
                                if (d.type == "trending") {
                                    var url = d.obj.resourceVisualization.previewImageUrl;
                                    url = url.substring(url.indexOf("/drives")); //remove prefix
                                    url = url.substring(0, url.indexOf("thumbnails")); //remove ending
                                    url = "https://graph.microsoft.com/beta" + url; //add graph to front
                                    vgeService.getFileByPath(url).then(function(fileresult) {
                                        setRootNode(createNode(fileresult.data.id, fileresult.data.name, "files", (fileresult.pic == "/images/07trending.png") ? "/images/06files.png" : d.pic, fileresult.data), false);
                                    }, function(err) {
                                        alert(err); //TODO
                                    });
                                }
                                else
                                    setRootNode(d, false);
                            }
                        }
                    })
                    .on('mouseover', function(d, i) {
                        //prevent while dragging
                        if (d3.event.defaultPrevented) return true;

                        // switch to detail view
                        $scope.showDetails = true;
                        $scope.showFilters = false;

                        // show the json
                        $scope.json = d.obj;
                        $scope.$apply();
                    })
                    .call(force.drag);
            
                //exit old nodes
                node.exit().remove();
            };

            var cloneNode = function(node) {
                var clone = createNode(node.objid, node.text, node.type, node.pic, node.obj);
                clone.loadStatus = node.loadStatus;
                for (var i = 0; i < node.children.length; i++)
                    clone.children.push(cloneNode(node.children[i]));
                return clone;
            };

            //returns a list of all child nodes under the spotlight
            var flatten = function(data) {
                var nodes = [], i = 0;

                function recurse(node) {
                    node.radius = 20;
                    if (node.children)
                        node.size = node.children.reduce(function(p, v) {return p + recurse(v); }, 0);
                    if (!node.id) 
                        node.id = ++i;
                    if (!node.hide)
                        nodes.push(node);
                    return node.size;
                }

                data.size = recurse(data);
                return nodes;
            };

            // function for d3 collide
            var collide = function(node) {
                var r = node.radius + 16,
                    nx1 = node.x - r,
                    nx2 = node.x + r,
                    ny1 = node.y - r,
                    ny2 = node.y + r;
                return function(quad, x1, y1, x2, y2) {
                    if (quad.point && (quad.point !== node)) {
                        var x = node.x - quad.point.x,
                            y = node.y - quad.point.y,
                            l = Math.sqrt(x * x + y * y),
                            r = node.radius + quad.point.radius;
                        if (l < r) {
                            l = (l - r) / l * .5;
                            node.x -= x *= l;
                            node.y -= y *= l;
                            quad.point.x += x;
                            quad.point.y += y;
                        }
                    }
                    return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
                };
            };

            // tick
            var tick = function(e) {
                var q = d3.geom.quadtree(nodes), i = 0, n = nodes.length;
                while (++i < n) {
                    q.visit(collide(nodes[i]));
                }

                link.attr('x1', function(d) { return d.source.x; })
                    .attr('y1', function(d) { return d.source.y; })
                    .attr('x2', function(d) { return d.target.x; })
                    .attr('y2', function(d) { return d.target.y; });
            
                visual.selectAll("circle")
                    .attr("cx", function(d) { return d.x; })
                    .attr("cy", function(d) { return d.y; });
            };

            // set the root (top) node
            var setRootNode = function(node, isback) {
                vgeService.wait(true);

                $timeout(function () {
                    // reset next links
                    vgeService.resetNextLinks();

                    // get the node type
                    var nodeType = {};
                    for (var i = 0; i < $scope.typeColors.length; i++) {
                        if (node.type == $scope.typeColors[i].type) {
                            nodeType = $scope.typeColors[i];
                            break;
                        }
                    }

                    // set node
                    currentData = node;
                    $scope.type = node.type;

                    // reset filters
                    for (var i = 0; i < $scope.typeColors.length; i++) {
                        if (isback)
                            $scope.typeColors[i].show = currentData.loadStatus[$scope.typeColors[i].type];
                        else
                            $scope.typeColors[i].show = (nodeType.defaultExpands.indexOf($scope.typeColors[i].type) != -1);
                        $scope.typeColors[i].more = false;

                        if ($scope.typeColors[i].show) {
                            $scope.toggleFilter($scope.typeColors[i]);
                        }
                    }
                });
            }

            // initialization
            var width = window.innerWidth - 320; // account for menu width
            var height = window.innerHeight - 50; // account for header height
            var force, visual, link, node, currentData, nodes, links, previousNode;
            var currentData = {};
            
            // initialize force
            force = d3.layout.force()
                .on('tick', tick)
                .charge(function (d) { return d._children ? -d.size / 100 : -30; })
                .friction(0.5);
                    
            // initialize the d3 objects for force
            visual = d3.select('#divCanvas').append('svg')
                .attr('width', width)
                .attr('height', height);

            // resize visual and force
            visual.attr('width', width).attr('height', height);
            force.size([width, height]);

            // initialize visual using the graph getting ME
            $scope.reset();
        }
    }]);
})();