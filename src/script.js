// The goal of this is to create JSON that is completely compatible with CircleCI's
// YAML parser.


let baseConfig = { version: 2.1, workflows: {}, jobs: {} }

// Step node.
function StepNode() {
    //this.addProperty("Run Command", "string")
    this.widget = this.addWidget("text", "Name", "", "Section name")
    this.addInput("In", "value")
    this.addOutput("Out", "value")
    this.properties = { level: 0 }
}
StepNode.title = "SECTION"
StepNode.prototype.onExecute = function() {
    this.setOutputData(0, { run: this.getInputOrProperty("name") })
}

LiteGraph.registerNodeType("circleci/run", StepNode)


// Actual graph.
var graph = new LGraph()
var canvas = new LGraphCanvas("#mycanvas", graph)

graph.start()

const ctx = document.getElementById("mycanvas").getContext("2d")
ctx.canvas.width = (window.innerWidth * 0.6)
ctx.canvas.height = (window.innerHeight * 0.8)


const process = () => {
    graph.arrange()
    let workflows = graph.findNodesByType("circleci/run")
    console.log(graph._nodes)
    let config = ""
    workflows.forEach(workflow => {
            config += JSON.stringify(workflow.getOutputData(0), null, 2) + "\n"
        })
        //document.getElementById("config").innerHTML = config
}


const OFFSET_LEFT = 20
const OFFSET_TOP = 20
const NODE_SIZE = 250

const create_section = () => {
    let x_pos = 20

    const nodes = graph._nodes
    const selected = nodes.filter(node => {
        return node.is_selected
    })

    if (!(selected.length)) {
        const level = 0
        const y = calculate_last_position(nodes, level)
        const new_node = graph.add(LiteGraph.createNode('circleci/run'))
        new_node.pos = [x_pos, y + 20 + OFFSET_TOP]
    } else {
        const level = selected[0].properties.level + 1
        console.log("level:", level)
        const y = calculate_last_position(nodes, level)
        const new_node = graph.add(LiteGraph.createNode('circleci/run'))
        new_node.pos = [(NODE_SIZE * level) + OFFSET_LEFT, y + 20 + OFFSET_TOP]
        new_node.properties.level = level
        selected[0].connect(0, new_node, 0)
    }
}


const calculate_last_position = (nodes, lev) => {
    let y = 0

    nodes.forEach(node => {
        if (node.properties.level == lev) {
            if ((node.pos[1] + node.size[1]) > y)
                y = node.pos[1] + node.size[1]
        }
    })
    return y
}