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
    .controller("visualCtrl", ["$scope", "$location", "vgeService", function($scope, $location, vgeService) {
        $scope.typeColors = [
            { type: "me", text: "Me", color: "#BAD80A", show: true, enabled: false },
            { type: "people", text: "People", color: "#FFC800", show: true, enabled: true },
            { type: "directs", text: "Direct Reports", color: "#BAD80A", show: false, enabled: true },
            { type: "manager", text: "Manager", color: "#BAD80A", show: false, enabled: true },
            { type: "trending", text: "Trending", color: "#BAD80A", show: false, enabled: true },
            { type: "files", text: "Files", color: "#990000", show: false, enabled: true },
            { type: "messages", text: "Messages", color: "#BAD80A", show: false, enabled: true },
            { type: "events", text: "Events", color: "#BAD80A", show: false, enabled: true },
            { type: "contacts", text: "Contacts", color: "#BAD80A", show: false, enabled: true },
            { type: "groups", text: "Groups", color: "#BAD80A", show: false, enabled: true },
            { type: "created", text: "Created By", color: "#BAD80A", show: false, enabled: true },
            { type: "modified", text: "Modified By", color: "#BAD80A", show: false, enabled: true }
            ///MORE HERE
        ];

        // private function to get color based on the node type
        var getColor = function(type) {
            for (var i = 0; i < $scope.typeColors.length; i++) {
                if ($scope.typeColors[i].type === type)
                    return $scope.typeColors[i].color;
            }
        };

        // toggle the menu
        $scope.showMenu = false;
        $scope.toggleMenu = function() {
            $scope.showMenu = !$scope.showMenu;
        };

        if (!vgeService.kurve.isLoggedIn())
            $location.path("/login");
        else {
            var width = window.innerWidth;
            var height = window.innerHeight;
            var force, visual, link, node, currentData;

            // gets cache code to prevent node cache
            var getCacheCode = function () {
                var range = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
                var id = '';
                for (i = 0; i < 8; i++)
                    id += range[parseInt(Math.random() * 36)];
                return id;
            };

            // updateVisual function for refreshing the d3 visual
            var updateVisual = function(data) {
                //clear all visuals
                visual.selectAll('circle').remove();
                visual.selectAll('defs').remove();
                visual.selectAll('line').remove();
        
                //go through children to set radius
                setRadius(data, 20);
        
                //prepare the data and restart the force
                data.fixed = true;
                data.x = width / 2;
                data.px = width / 2;
                data.y = height / 2;
                data.py = height / 2;
                data.radius = 30;
                currentData = data;
                var nodes = flatten(data);
                var links = d3.layout.tree().links(nodes);
        
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
            
                //add defs for dynamic patterns
                var def = visual.append('defs');
                node.enter().append('pattern')
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
            
                //add the nodes
                node.enter().append('circle')
                    .attr('id', function(d) { return d.code + '_c'; })
                    .attr('fill', function(d) { return (d.pic != '') ? 'url(#' + d.code + ')' : getColor(d.type); })
                    .attr('r', function(d) { return d.radius - 2; })
                    .attr('stroke', function(d) { return getColor(d.type); })
                    .attr('stroke-width', '3px')
                    .style('cursor', 'default')
                    .attr('class', 'node')
                    .on('click', function (d) {
                        //prevent while dragging
                        if (d3.event.defaultPrevented) return true;

                        //TODO: handle click event
                    })
                    .on('mouseover', function(d, i) {
                        //prevent while dragging
                        if (d3.event.defaultPrevented) return true;

                        //TODO: show tooltip
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
                    if (!node.code)
                        node.code = getCacheCode();
                    if (node.children) 
                        node.size = node.children.reduce(function(p, v) {return p + recurse(v); }, 0);
                    if (!node.id) 
                        node.id = ++i;
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
                var q = d3.geom.quadtree(currentData), i = 0, n = currentData.length;
                while (++i < n) {
                    q.visit(collide(currentData[i]));
                }

                link.attr('x1', function(d) { return d.source.x; })
                    .attr('y1', function(d) { return d.source.y; })
                    .attr('x2', function(d) { return d.target.x; })
                    .attr('y2', function(d) { return d.target.y; });
        
                visual.selectAll("circle")
                    .attr("cx", function(d) { return d.x; })
                    .attr("cy", function(d) { return d.y; });
            };

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

            // initialize visual using the graph
            vgeService.wait(true);
            currentData = {};
            vgeService.me().then(function(meResults) {
                currentData = { id: meResults.id, text: meResults.displayName, type: "me", pic: "", children: [], code: getCacheCode() };

                // next get people
                vgeService.people(meResults.id).then(function(peopleResults) {
                    // add the people as children
                    for (var i = 0; i < peopleResults.value.length; i++) {
                        var newNode = { id: peopleResults.value[i].id, text: peopleResults.value[i].displayName, type: "people", pic: "", children: [] };
                        currentData.children.push(newNode);

                        // get photo for the user
                        vgeService.photo(peopleResults.value[i].id, newNode).then(function(photoResults) {
                            photoResults.node.pic = photoResults.pic;
                            document.getElementById(photoResults.node.code).children[0].setAttribute("href", photoResults.node.pic);
                            document.getElementById(photoResults.node.code + "_c").setAttribute("fill", "url(#" + photoResults.node.code + ")");
                        });
                    }
                    
                    // update the visual and stop spinner
                    updateVisual(currentData);
                    vgeService.wait(false);

                    // get the photo for me
                    vgeService.photo(meResults.id, currentData).then(function(photoResults) {
                        photoResults.node.pic = photoResults.pic;
                        document.getElementById(photoResults.node.code).children[0].setAttribute("href", photoResults.node.pic);
                        document.getElementById(photoResults.node.code + "_c").setAttribute("fill", "url(#" + photoResults.node.code + ")");
                    });
                });
            });

            // toggles
            $scope.toggleFilter = function(filterItem) {
                switch (filterItem.type) {
                    case "files":
                        if (filterItem.show) {
                            vgeService.wait(true);

                            // query for files
                            vgeService.files(currentData.id).then(function(fileResults) {
                                // add the people as children
                                for (var i = 0; i < fileResults.value.length; i++) {
                                    var newNode = { id: fileResults.value[i].id, text: fileResults.value[i].name, type: "files", pic: "", children: [] };
                                    currentData.children.push(newNode);

                                    // TODO: only get thumbnails for files
                                    // get thumbnail for the file
                                    vgeService.thumbnail(currentData.id, newNode.id, newNode).then(function(photoResults) {
                                        photoResults.node.pic = photoResults.pic;
                                        document.getElementById(photoResults.node.code).children[0].setAttribute("href", photoResults.node.pic);
                                        document.getElementById(photoResults.node.code + "_c").setAttribute("fill", "url(#" + photoResults.node.code + ")");
                                    });
                                }

                                // update the visual and stop spinner
                                updateVisual(currentData);
                                vgeService.wait(false);
                            });
                        }
                        break;
                }
            };
        }
    }]);
})();