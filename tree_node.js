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

	this.layer      = new Kinetic.Layer();
	this.line_layer = new Kinetic.Layer();

	// Create the tree
	var node = new Node(300,200,null,this,"DISPLAYED");
	for(i = 0; i < 3; i++) {
		var child_node = new Node((i*100)+300,300,node,this,"HIDDEN");
		node.addChild(child_node);
		for(j = 0; j < 3; j++) {
			var grandchild_node = new Node(((i*100) + (j*100))+300,400,child_node,this,"HIDDEN");
			child_node.addChild(grandchild_node);
		}
	}
        // add the layer to the stage
        stage.add(this.line_layer);
        stage.add(this.layer);
}

Tree.prototype.addKineticObject = function(kinetic_object) {
	this.layer.add(kinetic_object);
	kinetic_object.moveToTop();
}
Tree.prototype.addLineObject = function(line_object) {
	this.layer.add(line_object);
}

Tree.prototype.redraw = function() {this.layer.draw()}

/***************************************
 *
 */
function Node(x,y,parent_node,tree,display_status) {

	/**************************
	 * Declare private members
	 */
	var x,y;
	var tree;
	var parent_node;
	var children;
	
	var kinetic_obj, line_obj;


	// Status members
	var children_showing;
	var children_fixed;	
	var display_status;

	/**************************
	 * Initialise this instance
	 */
	this.x = x;
	this.y = y;
	this.parent_node = parent_node;
	this.display_status = display_status;
	this.children = new Array();

	// Each node needs to store a reference
	// to the tree it's part of
	this.tree = tree;

	
	var node = this;
	if(this.parent_node != null) {
		// This has a parent, so we need to create a line
		// to the parent node
		this.line_obj = new Kinetic.Line({
		   points: [parent_node.getX(), parent_node.getY(), x, y],
		   strokeWidth: 4,
		   lineCap: "round",
		   lineJoin: "round"
		});
		this.tree.addLineObject(this.line_obj);
	}



	// Initialise all the event handlers
	this.kinetic_obj = new Kinetic.Circle({
          x: this.x,
          y: this.y,
          radius: 30,
          fill: 'red',
          stroke: '#ccc',
	  strokeWidth: 4,
          visible: false,
	  draggable: true
	});

	// Add this node's kinetic JS object to the
	// containing tree
	this.tree.addKineticObject(this.kinetic_obj);

	this.kinetic_obj.on("mousedown",function() {
	});
	this.kinetic_obj.on("mouseup",function() {
	});
	this.kinetic_obj.on("click",function() {
		node.click();
		node.tree.redraw();
	});
	this.kinetic_obj.on("mouseenter",function() {
		node.hover();
		node.tree.redraw();
	});
	this.kinetic_obj.on("mouseleave",function() {
		node.unHover();
		node.tree.redraw();
	});
	this.kinetic_obj.on("dragmove",function() {
		node.move();
	});

	// Set the display status of this node
	this.setDisplayStatus(display_status);


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

/*
 * A Node can have one of three display statuses:
 *
 * DISPLAYED: This node is permanently displayed
 * TEASER:    This node is temporarily displayed as a teaser
 *            of its parent's children.
 * HIDDEN:    This node isn't displayed
 */
Node.prototype.setDisplayStatus = function(status) {

	if (status == "DISPLAYED") {

		this.display_status = "DISPLAYED";
		
		// This node may be currently hidden,
		// so show it.	
		this.kinetic_obj.show();
		this.kinetic_obj.setFill("#444");
		this.kinetic_obj.setStroke("#333");

		if (this.line_obj) {
			this.line_obj.show();
			this.line_obj.setFill("#000044");
			this.line_obj.setStroke("#333");
		}

	} else if (status == "TEASER") {
	
		// Used for other logic
		this.display_status = "TEASER";
	
		// This node may be currently hidden,
		// so show it.	
		this.kinetic_obj.show();
		this.kinetic_obj.setFill("blue");
		
		if(this.line_obj) {
			this.line_obj.show();
			this.line_obj.setFill("blue");
		}


	} else if (status == "HIDDEN") {
		// Hide this node and it's subtree
		this.kinetic_obj.hide();
		
		if(this.line_obj) {
			this.line_obj.hide();
		}
	} else {
		// Do nothing
	}
}

/*
 * Display all the children as a teaser,
 * not permanently displaying them
 */
Node.prototype.showChildren = function() {
	// Loop throw all the children
	// and set their displayed status
	// to TEASER
	//
	var child;
	for (var i = 0; i < this.children.length; i++) {
		child = this.children[i];
		child.setDisplayStatus("TEASER");
	}
	this.children_showing = 1;	
}
Node.prototype.hideChildren = function() {
	// Loop throw all the children
	// and set their displayed status
	// to TEASER
	var child;
	for (var i = 0; i < this.children.length; i++) {
		child = this.children[i];
		child.setDisplayStatus("HIDDEN");
	}
	this.children_showing = 0;	
}


/*
 * Permanently attaches the children to
 * the tree
 */
Node.prototype.fixChildren = function() {
	var child;
	for (var i = 0; i < this.children.length; i++) {
		child = this.children[i];
		child.setDisplayStatus("DISPLAYED");
	}
	this.children_fixed = 1;
	this.children_showing = 0;
}



/****************************************
 * Event handler functions
 */

Node.prototype.hover = function() {
	
	// Modify this node
	this.kinetic_obj.moveToTop();
	this.kinetic_obj.setFill('#cc0000');

	// Do something with the children
	if(!this.children_fixed) {
		this.showChildren();
	}
}

Node.prototype.unHover = function() {
	
	// Modify this node
	this.kinetic_obj.setFill('444');

	// Do something with the children
	if (!this.children_fixed) {
		this.hideChildren();
	}
}

Node.prototype.click = function() {
	
	// If the children are showing and aren't
	// already attached,fix them to the tree permanently
	if (this.children_showing && !this.children_fixed) {
		this.fixChildren();	
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
