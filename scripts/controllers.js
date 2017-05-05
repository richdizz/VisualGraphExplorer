(function() {
    angular.module("vge.controllers", [])
    .controller("appCtrl", ["$scope", function($scope) {
        $scope.showSpinner = false;

        //listen spinner toggles
        $scope.$on("wait", function (evt, val) {
            $scope.showSpinner = val;
        });
    }])
    .controller("loginCtrl", ["$scope", "$location", "vgeService", function($scope, $location, vgeService) {
        if (vgeService.kurve.isLoggedIn())
            $location.path("/visual");
        else {
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
        // scope variables
        $scope.json = {};
        $scope.type = "me";
        $scope.typeColors = [
            { type: "me", text: "Me", color: "#e81224", show: true, enabled: false, pic: "/images/01me.png", more: false, types: ["me"] },
            { type: "groups", text: "Groups", color: "#f7630c", show: false, enabled: true, pic: "/images/02groups.png", more: false, types: ["me", "people", "members"] },
            { type: "people", text: "People", color: "#ffb900", show: false, enabled: true, pic: "/images/03people.png", more: false, types: ["me", "people", "members"] },
            { type: "members", text: "Members", color: "#ffb900", show: true, enabled: true, pic: "/images/03people.png", more: false, types: ["groups"] },
            { type: "directs", text: "Direct Reports", color: "#fce100", show: false, enabled: true, pic: "/images/04directs.png", more: false, types: ["me", "people", "members"] },
            { type: "manager", text: "Manager", color: "#bad80a", show: false, enabled: true, pic: "/images/05manager.png", more: false, types: ["me", "people", "members"] },
            { type: "files", text: "Files", color: "#16c60c", show: false, enabled: true, pic: "/images/06files.png", more: false, types: ["me", "groups", "people", "members"] },
            { type: "trending", text: "Trending", color: "#00b7c3", show: false, enabled: true, pic: "/images/07trending.png", more: false, types: ["me", "people", "members"] },
            { type: "messages", text: "Messages", color: "#0078d7", show: false, enabled: true, pic: "/images/08messages.png", more: false, types: ["me", "people", "members"] },
            { type: "conversations", text: "Conversations", color: "#0078d7", show: false, enabled: true, pic: "/images/08messages.png", more: false, types: ["groups"] },
            { type: "events", text: "Events", color: "#4f4bd9", show: false, enabled: true, pic: "/images/09events.png", more: false, types: ["me", "people", "members"] },
            { type: "contacts", text: "Contacts", color: "#744da9", show: false, enabled: true, pic: "/images/10contacts.png", more: false, types: ["me", "people", "members"] },
            { type: "notes", text: "Notes", color: "#881798", show: false, enabled: true, pic: "/images/11notes.png", more: false, types: ["me", "people", "members"] },
            { type: "plans", text: "Plans", color: "#e3008c", show: false, enabled: true, pic: "/images/12plans.png", more: false, types: ["me", "people", "members"] }
            ///MORE HERE
        ];
        $scope.showDetails = true;
        $scope.showFilters = false;

        // toggle the menu
        $scope.toggleMenu = function(option) {
            $scope.showDetails = (option == "details");
            $scope.showFilters = (option == "filters");
        };

        // get more data
        $scope.toggleMore = function(filterItem) {
            // start the spinner
            vgeService.wait(true);

            switch (filterItem.type) {
                case 'groups': 
                    // query for groups
                    vgeService.nextGroup().then(function(groupResult) {
                        addNodes('groups', groupResult);
                    });
                break;
                case 'files': 
                    // query for files
                    vgeService.nextFiles().then(function(fileResult) {
                        addNodes('files', fileResult);
                    });
                break;
                case 'messages': 
                    // query for messages
                    vgeService.nextMessages().then(function(messageResult) {
                        addNodes('messages', messageResult);
                    });
                break;
                case 'events': 
                    // query for events
                    vgeService.nextEvents().then(function(eventResult) {
                        addNodes('events', eventResult);
                    });
                break;
                case 'contacts': 
                    // query for contacts
                    vgeService.nextContacts().then(function(contactResult) {
                        addNodes('contacts', contactResult);
                    });
                break;
                case 'notes': 
                    // query for notes
                    vgeService.nextNotes().then(function(noteResult) {
                        addNodes('notes', noteResult);
                    });
                break;
            }
        };

        // show or hide data
        $scope.toggleFilter = function(filterItem, force) {
            // check if force is requested
            force = force || false;
            if (force) {
                filterItem.show = true;
            }

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
                        case "groups":
                            // query for groups
                            vgeService.groups(currentData.id).then(function(groupResults) {
                                addNodes('groups', groupResults);
                                setLoaded('groups');
                            }, function () {
                                vgeService.wait(false);
                            });
                            break;
                        case "people":
                            // query for people
                            vgeService.people(currentData.id).then(function(peopleResults) {
                                addNodes('people', peopleResults);
                                setLoaded('people');
                            }, function () {
                                vgeService.wait(false);
                            });
                            break;
                        case "members":
                            // query for members
                            vgeService.members(currentData.id).then(function(memberResult) {
                                addNodes('members', memberResult);
                                setLoaded('members');
                            }, function () {
                                vgeService.wait(false);
                            });
                            break;
                        case "directs":
                            // query for directs
                            vgeService.directs(currentData.id).then(function(directResult) {
                                addNodes('directs', directResult);
                                setLoaded('directs');
                            }, function () {
                                vgeService.wait(false);
                            });
                            break;
                        case "manager":
                            // query for manager
                            vgeService.manager(currentData.id).then(function(managerResult) {
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
                            vgeService.files(collection, currentData.id).then(function(fileResults) {
                                addNodes('files', fileResults);
                                setLoaded('files');
                            }, function () {
                                vgeService.wait(false);
                            });
                            break;
                        case "trending":
                            // query for trending
                            vgeService.trending(($scope.selectedNode || currentData).id).then(function(trendingResult) {
                                addNodes('trending', trendingResult);
                                setLoaded('trending');
                            }, function () {
                                vgeService.wait(false);
                            });
                            break;
                        case "messages":
                            // query for messages
                            vgeService.messages(currentData.id).then(function(messageResult) {
                                addNodes('messages', messageResult);
                                setLoaded('messages');
                            }, function () {
                                vgeService.wait(false);
                            });
                            break;
                        case "conversations":
                            // query for messages
                            vgeService.conversations(currentData.id).then(function(conversationResult) {
                                addNodes('conversations', conversationResult);
                                setLoaded('conversations');
                            }, function () {
                                vgeService.wait(false);
                            });
                            break;
                        case "events":
                            // query for events
                            vgeService.events(currentData.id).then(function(eventResult) {
                                addNodes('events', eventResult);
                                setLoaded('events');
                            }, function () {
                                vgeService.wait(false);
                            });
                            break;
                        case "contacts":
                            // query for contacts
                            vgeService.contacts(currentData.id).then(function(contactResult) {
                                addNodes('contacts', contactResult);
                                setLoaded('contacts');
                            }, function () {
                                vgeService.wait(false);
                            });
                            break;
                        case "notes":
                            // query for notes
                            vgeService.notes(currentData.id).then(function(noteResult) {
                                addNodes('notes', noteResult);
                                setLoaded('notes');
                            }, function () {
                                vgeService.wait(false);
                            });
                            break;
                        case "plans":
                            // TODO: query for plans
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
                setRootNode(newNode)
            });
        }

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

            var newNode = { id: id, 
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
                        vgeService.photo(newNode.id, "groups", newNode).then(function(photoResults) {
                            setNodeImage(photoResults);
                        });
                    }

                    // update the 'get more' label
                    setMore('groups', vgeService.groupsNextLink != null);
                break;
                case 'people':
                case 'members':
                    for (var i = 0; i < result.value.length; i++) {
                        if (result.value[i].id == currentData.id) {
                            continue;
                        }

                        var newNode = createNode(result.value[i].id, result.value[i].name, type, '/images/03people.png', result.value[i]);
                        currentData.children.push(newNode);

                        // get photo for the user
                        vgeService.photo(result.value[i].id, "users", newNode).then(function(photoResults) {
                            setNodeImage(photoResults);
                        });
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
                        });
                    }
                break;
                case 'manager':
                    var newNode = createNode(result.id, result.name, 'manager', '/images/05manager.png', result);
                    currentData.children.push(newNode);

                    // get photo for the user
                    vgeService.photo(result.id, "users", newNode).then(function(photoResults) {
                        setNodeImage(photoResults);
                    });
                break;
                case 'trending':
                    for (var i = 0; i < result.value.length; i++) {
                        var newNode = createNode(result.value[i].id, result.value[i].name, 'trending', '/images/07trending.png', result.value[i]);
                        currentData.children.push(newNode);

                        // get thumbnail if this is a file
                        vgeService.thumbnail(currentData.id, result.value[i].resourceReference.id + "/thumbnails", newNode).then(function(photoResults) {
                            setNodeImage(photoResults);
                        });
                    }
                break;
                case 'files':
                    // add the people as children
                    for (var i = 0; i < result.value.length; i++) {
                        var newNode = createNode(result.value[i].id, result.value[i].name, 'files', '/images/06files.png', result.value[i]);
                        currentData.children.push(newNode);

                        // get thumbnail if this is a file
                        if (result.value[i].file) {
                            vgeService.thumbnail(currentData.id, "drive/items/" + newNode.id + "/thumbnails", newNode).then(function(photoResults) {
                                setNodeImage(photoResults);
                            });
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
                        var newNode = createNode(result.value[i].id, result.value[i].name, 'conversations', '/images/08messages.png', result.value[i]);
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

            // update the visual and stop spinner
            updateVisual(currentData);
            vgeService.wait(false);
        }

        // set node image
        var setNodeImage = function(node, image) {
            if (node == null) {
                throw 'missing node'
            }

            // if only one parameter is supplied, assumed node is an object of needed parameters
            if (image == null && node.node == null && node.pic == null) {
                console.error('missing image');
            }
            else {
                image = node.pic;
                node = node.node;
            }

            node.pic = image;

            var element = document.getElementById(node.code);
            if (element != null) {
                element.children[0].setAttribute("href", node.pic);
            }

            element = document.getElementById(node.code + "_c");
            if (element != null) {
                element.setAttribute("fill", "url(#" + node.code + ")");
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
        }

        // initialization
        if (!vgeService.kurve.isLoggedIn())
        {
            // ensure the user is signed in
            $location.path("/login");
        }
        else {
            var width = window.innerWidth;
            var height = window.innerHeight;
            var force, visual, link, node, currentData, nodes, links;
            var currentData = {};

            // updateVisual function for refreshing the d3 visual
            var updateVisual = function(data) {
                //prepare the data and restart the force
                data.fixed = true;
                data.x = width / 2;
                data.px = width / 2;
                data.y = height / 2;
                data.py = height / 2;
                data.radius = 30;
                nodes = flatten(data);
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

                        // set this node to the new root node
                        if (currentData.id != d.id) {
                            setRootNode(d);
                        }
                    })
                    .on('mouseover', function(d, i) {
                        //prevent while dragging
                        if (d3.event.defaultPrevented) return true;

                        //TODO: show tooltip
                        $scope.json = d.obj;
                        $scope.$apply();
                    })
                    .on('mousemove', function(d, i) {
                        //prevent while dragging
                        if (d3.event.defaultPrevented) return true;

                        //TODO: move tooltop
                    })
                    .on('mouseout', function (d, i) {
                        //prevent while dragging
                        if (d3.event.defaultPrevented) return true;

                        //TODO: hide tooltip
                    })
                    .call(force.drag);
        
                //exit old nodes
                node.exit().remove();
            };

            var setRadius = function(data, r) {
                for (var i = 0; i < data.children.length; i++) {
                    data.children[i].radius = r;
                    setRadius(data.children[i], r);
                }
            }

            //returns a list of all child nodes under the spotlight
            var flatten = function(data) {
                var nodes = [], i = 0;

                function recurse(node) {
                    if (!node.radius)
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
            var setRootNode = function(node) {
                vgeService.wait(true);

                $timeout(function () {
                    // reset next links
                    vgeService.resetNextLinks();

                    // reset filters
                    for (var i = 0; i < $scope.typeColors.length; i++) {
                        $scope.typeColors[i].show = false;
                    }

                    // set node
                    currentData = node;
                    $scope.type = node.type;

                    var filters = [];
                    switch (node.type) {
                        case 'me':
                        case 'people':
                        case 'members':
                            // get image on any "me" node, assumed to already be 
                            // downloaded for the others
                            if (node.type == 'me') {
                                // get the photo for me
                                vgeService.photo(currentData.id, "users", currentData).then(function(photoResults) {
                                    setNodeImage(photoResults);
                                });
                            }
                            
                            filters.push('people');
                        break;
                        case 'groups':
                            filters.push('members');
                        break;
                    }

                    // toggle filters
                    for (var i = 0; i < filters.length; i++) {
                        var filter = getFilter(filters[i]);
                        if (filter == null) {
                            throw 'invalid filter';
                        }
                        $scope.toggleFilter(filter, true);
                    }

                    // either have a filter update the view, or do it
                    // if none was requested
                    if (filters.length == 0) {
                        // update the visual and stop spinner
                        updateVisual(currentData);
                        vgeService.wait(false);
                    }
                });
            }

            // initialize force
            force = d3.layout.force()
                .on('tick', tick)
                .charge(function(d) {
                    return d._children ? -d.size / 100 : -30;
                });
                
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