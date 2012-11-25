/*
 *  Creates a tree that uses the Kinetic JS library
 */
function Tree() {
	this.init();
}
Tree.prototype.init = function() {
	// Look for a canvas
	var canvas = document.getElementById('');

	// Create a kineticjs stage
	var stage = new Kinetic.Stage({
	   container: 'container',
	   width: document.width,
	   height: document.height
	});

	this.layer = new Kinetic.Layer();

	// Create the tree
	var node = new Node(50,50,null,this);
	for(i = 0; i < 3; i++) {
		var child_node = new Node((i*50),100,node,this);
		node.addChild(child_node);
		for(j = 0; j < 3; j++) {
			var grandchild_node = new Node(((i*50) + (j*50)),200,child_node,this);
			child_node.addChild(grandchild_node);
		}
	}
        // add the layer to the stage
        stage.add(this.layer);
}

Tree.prototype.addKineticObject = function(kinetic_object) {
	this.layer.add(kinetic_object);
}

/***************************************
 *
 */
function Node(x,y,parent_node,tree) {
	this.init(x,y,parent_node,tree);
}


Node.prototype.init = function(x,y,parent_node,tree) {
	
	// Init the fields
	this.x = x;
	this.y = y;
	this.parent_node = parent_node;

	// Each node needs to store a reference
	// to the tree it's part of
	this.tree = tree;

	
	var node = this;
	if(this.parent_node != null) {
		// This has a parent, so we need to create a line
		// to the parent node
		this.line_obj = new Kinetic.Line({
		   points: [parent_node.getX(), parent_node.getY(), x, y],
		   strokeWidth: 2,
		   lineCap: "round",
		   lineJoin: "round"
		});
		this.tree.addKineticObject(this.line_obj);
	}



	// Initialise all the event handlers
	this.kinetic_obj = new Kinetic.Circle({
          x: this.x,
          y: this.y,
          radius: 30,
          fill: 'red',
          stroke: 'black',
	  strokeWidth: 4,
	  draggable: true
	});
	//kinetic_layer.add(this.kinetic_obj);
	this.tree.addKineticObject(this.kinetic_obj);

	this.kinetic_obj.on("mousedown",function() {
		//node.select(null);
	});
	this.kinetic_obj.on("mouseup",function() {
	});
	this.kinetic_obj.on("dragmove",function() {
		node.move();
	});

	this.children = new Array();
}


/*
 * Loop through all the children and move them
 *
 */
Node.prototype.move = function() {

	var old_x = this.x;
	var old_y = this.y;

	// Store new position from kinetic obj
	this.x = this.kinetic_obj.getX();
	this.y = this.kinetic_obj.getY();

	var dx = this.x - old_x;
	var dy = this.y - old_y;

	if(this.parent_node) {
		// Need to move the line to the parent
		var new_points = [this.parent_node.getX(), this.parent_node.getY(), this.x, this.y];
		this.line_obj.setPoints(new_points);
	}

	// Move the subtree starting from this node
	// by the same amount
	this.moveSubtree(dx,dy);

}

/*
 * Move this node to parent_node.position + offset.
 * Used when an ancestor node is being moved,
 * and maintains the subtree node positions in
 * relation to each other.
 *
 */
Node.prototype.moveSubtree = function(dx, dy) {
	
	var child;
	for(var child_idx = 0; child_idx < this.children.length; child_idx++) {
		child = this.children[child_idx];
		child.setPosition(child.getX() + dx, child.getY() + dy);
		child.moveSubtree(dx,dy);
	}
}


/*
 * Set the position of this node (not via kinetic dragging)
 * Update the node position, kinetic obj position and the line
 * to the parent
 *
 */
Node.prototype.setPosition = function(x, y) {
	this.x = x;
	this.y = y;

	this.kinetic_obj.setPosition(x,y);

	var new_points = [this.parent_node.getX(), this.parent_node.getY(), this.x, this.y];
	this.line_obj.setPoints(new_points);
}


Node.prototype.addChild = function(child) {
	this.children.push(child);
}

Node.prototype.setDisplayStatus = function(status) {

	if (status == "DISPLAYED") {
		// This node should be displayed
		this.kinetic_obj.setFill("blue");
		this.line_obj.setFill("blue");
	} else if (status == "TEASER") {
		// Show this node as a teaser
	} else if (status == "HIDDEN") {
		// Hide this node and it's subtree
	} else {
		// Do nothing
	}
}

/****************************************
 * Getters and setters
 */
Node.prototype.setParent = function(node) {
	this.parent_node = node;
}
Node.prototype.getParent = function() {
	return this.parent;
}


Node.prototype.getX = function() {
	return this.x;
}
Node.prototype.getY = function() {
	return this.y;
}

Node.prototype.getKineticObj = function() {
	return this.kinetic_obj;
}

Node.prototype.getTree = function() {
	return this.tree;
}
