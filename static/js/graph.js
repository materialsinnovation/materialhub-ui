// Initialize graph canvas area
var svg = d3.select("#canvas")
  .on("click", function() {
    createNode(this);
    drawNodes();
  });

var gSelectors = svg.append("g")
  .attr("cursor", "pointer")
  .attr("pointer-events", "all");
var gNodes = svg.append("g")
  .attr("cursor", "pointer")
  .attr("pointer-events", "all");
var gLinks = svg.append("g")
  .attr("cursor", "pointer")
  .attr("pointer-events", "all");

// Initialize graph table area

// Variables for deciding which action to perform on clicking
var selected = 0;
var graphTypes = ["material", "process", "link", "delete"];

// Variables for drawing
var preventNewNode = false;

// Variables for drawSelectors
var buttonSpacing = 5;
var buttonHeight = 30;
var fills = ["#99f", "#99f", "#99f", "#f99"];

// Variables for Graph
var nodes = [];
var edges = [];

// Decide whether to update or not functions
function noNewNodes() {preventNewNode = true;}

function newNodes() {
  if (selected < 2) {preventNewNode = false;}
}



// Selector functions

function newSelect() {
  selected = this.id.slice(1,2);
  drawSelectors();
}

function drawSelectors() {
  gSelectors.remove()
  gSelectors = svg.append("g")
    .attr("cursor", "pointer")
    .attr("pointer-events", "all");

  for (i=0; i<4; i++) {
    let selector = gSelectors.append("rect")
      .attr("x", 3*buttonSpacing)
      .attr("y", 4*buttonSpacing + i*buttonSpacing + i*buttonHeight)
      .attr("width", 90)
      .attr("height", 30)
      .attr("fill", fills[i])
      .attr("id", "s" + i)
      .attr("rx", 4)
      .attr("ry", 4)
      .style("opacity", 0.55)
      .on("click", newSelect)
      .on("mouseover", noNewNodes)
      .on("mouseout", newNodes);
    gSelectors.append("text")
      .attr("x", 3*buttonSpacing + 4)
      .attr("y", 4*buttonSpacing + i*buttonSpacing + i*(buttonHeight+1) + buttonHeight/2 + buttonSpacing/2)
      .text(graphTypes[i])
      .attr("id", "t" + i)
      .on("click", newSelect)
      .on("mouseover", noNewNodes)
      .on("mouseout", newNodes);

    if (i==selected) {
      selector.style("stroke-width", 2);
      selector.style("opacity", 1);
    }
  }
}

async function cordraCreate(node) {
  let objType = (graphTypes[selected] == "material") ? "Material" : "ProcessHistory";
  objType = "Document";
  let res = await sendHTTPRequest(`/objects/?type=${objType}&full=true`, 'POST', JSON.stringify(node.properties));
  console.log(res);
  let uuid = (await res.json())["id"];
  console.log(uuid);
  node.properties.id = uuid;
  console.log(node);
}

async function cordraUpdate(properties) {
  // console.log(properties.id);
  let res = await sendHTTPRequest(`/objects/${properties.id}`, 'PUT', JSON.stringify(properties));
  console.log(res);
  let uuid = (await res.json())["id"];
  console.log(uuid);
}



// Node functions
var nodeCounter = -1;

function createNode(svg) {

  if (!preventNewNode) {
    // Create New node
    var coords = d3.mouse(svg);
    nodeCounter += 1;

    let newNode = {
      id: "n" + nodeCounter,
      x: coords[0],
      y: coords[1],
      properties: {
        type: graphTypes[selected],
        name: "",
        edgesIn: [],
        edgesOut: []
      }
    };

    nodes.push(newNode);
    // console.log(nodes);

    // Add the new node to Cordra
    cordraCreate(newNode);
  }
}

function drawNodes() {
  gNodes.remove()
  gNodes = svg.append("g")
    .attr("cursor", "pointer")
    .attr("pointer-events", "all");
  gNodes.selectAll("circle")
    .data(nodes)
    .enter().append("circle")
      .attr("cx", function(d) {return d.x;})
      .attr("cy", function(d) {return d.y;})
      .attr("r", 10)
      .attr("id", d => d.id)
      .attr("class", d => d.properties.type)
      .on("mouseover", noNewNodes)
      .on("mouseout", newNodes)
      .on("click", selectNode);
  // console.log(gNodes);

  return gNodes;
}

function deleteNode(id) {
  // Delete the node. Break on node.
  for (i=0; i<nodes.length; i++) {
    if (id == nodes[i].id) {
      nodes.splice(i, 1);
      break;
    }
  }
  // Delete Edges from node. No breaks. Full search.
  for (i=0; i<edges.length; i++) {
    if (id == edges[i].source.id) {
      edges.splice(i, 1);
    } else if (id == edges[i].target.id) {
      edges.splice(i, 1);
    }
  }
  drawNodes();
  drawEdges();
}


// Function for switching between adding edges,
// attributes, and delete
function selectNode() {
  if ((graphTypes[selected] == "material") || (graphTypes[selected] == "process")) {
    updateAttributes(this);
  } else if (graphTypes[selected] == "link") {
    addEdge(this);
  } else if (graphTypes[selected] == "delete") {
    deleteNode(this.id);
  }
}


// Edge Functions

var edgeCounter = -1;

// Nodes that have been clicked
var linkedNodes = [];

function addEdge(node) {
  linkedNodes.push(node);

  if (linkedNodes.length == 2) {
    // add edges to nodes and update cordra
    let node1, node2;
    // console.log(linkedNodes[0]);
    for (i=0; i<nodes.length; i++) {
      // console.log(nodes[i].id);
      if (nodes[i].id == linkedNodes[0].id) {
        node1 = nodes[i];
        // console.log(node1);
      } else if (nodes[i].id == linkedNodes[1].id) {
        node2 = nodes[i];
        // console.log(node2);
      }
    }
    node1.properties.edgesOut.push(node2.properties.id);
    node2.properties.edgesIn.push(node1.properties.id);
    cordraUpdate(node1.properties);
    cordraUpdate(node2.properties);

    // Edit the app info and redraw
    edgeCounter += 1;
    edges.push({
      id: "e" + edgeCounter,
      source: {
        id: linkedNodes[0].id,
        x: linkedNodes[0].cx.baseVal.value,
        y: linkedNodes[0].cy.baseVal.value
      },
      target: {
        id: linkedNodes[1].id,
        x: linkedNodes[1].cx.baseVal.value,
        y: linkedNodes[1].cy.baseVal.value
      }
    });
    linkedNodes = [];

    drawEdges();
  }
}


function drawEdges() {
  gLinks.remove();
  gLinks = svg.append("g")
    .attr("cursor", "pointer")
    .attr("pointer-events", "all");

  // console.log(edges);

  gLinks.selectAll("line")
    .data(edges)
    .enter()
    .append("line")
    .attr("x1", function(d) { return d.source.x; })
    .attr("y1", function(d) { return d.source.y; })
    .attr("x2", function(d) { return d.target.x; })
    .attr("y2", function(d) { return d.target.y; })
    .attr("id", function(d) { return d.id; });

  return gLinks;
}

function deleteEdges(id) {
  for (i=0; i<edges.length; i++) {
    if (id == edges[i].id) {
      edges.splice(i, 1);
      break;
    }
  }
  drawEdges();
}


// Attribute functions
var linkedNodes = [];

function updateEdges(node) {
  // console.log(node)
  // console.log(node.cx.baseVal.value)
  linkedNodes.push(node);

  if (linkedNodes.length == 2) {
    edges.push({
      source: {
        id: linkedNodes[0].id,
        x: linkedNodes[0].cx.baseVal.value,
        y: linkedNodes[0].cy.baseVal.value
      },
      target: {
        id: linkedNodes[1].id,
        x: linkedNodes[1].cx.baseVal.value,
        y: linkedNodes[1].cy.baseVal.value
      }
    });
    linkedNodes = [];
  }

  drawEdges();
  drawNodes();
}

function drawEdges() {
  // console.log(edges);

  let link = svg.selectAll("line")
    .data(edges)
    .enter()
    .append("line")
    .attr("x1", function(d) { return d.source.x; })
    .attr("y1", function(d) { return d.source.y; })
    .attr("x2", function(d) { return d.target.x; })
    .attr("y2", function(d) { return d.target.y; });

}


// Attribute editor
function closeModal() {
  var modal = document.getElementById("modal");
  modal.style.display = "none";
}

function updateAttributes(node) {
  var modal = document.getElementById("modal");
  modal.style.display = "block";
  // console.log(modal);
  var table = document.getElementById("attributes");
  var row = table.insertRow();
  var cell = row.insertCell(0);
  cell.innerHTML = "Name";
  var cell = row.insertCell(1);
  var input = document.createElement("input");
  input.setAttribute("type", "text");
  input.setAttribute("value", this.name);
  input.setAttribute("onchange", updateNode(this));
  cell.appendChild(input);
}

function updateNode() {
  // console.log("updateNode() called");
}


function addAttr() {
  // console.log(gNodes.selectAll("circle"));
  return null
};


function update() {
  gNodes.selectAll("circle").
    on("click", function() {
      var n = d3.select(this);
      n.attr("fill", "#888");
      // console.log(n);
  });
};

drawSelectors(svg, selected, graphTypes);
