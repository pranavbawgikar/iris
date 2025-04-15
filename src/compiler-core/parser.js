import { Program, Assignment, BinaryOp, Variable, Constant } from "./ir";

import { validateIR } from "./ir";

export function parseIR(json) {
    if(!validateIR(json)) {
        throw new Error(`Invalid IR: ${JSON.stringify(validateIR.errors)}`)
    }

    const parseNode = (node) => {
        switch(node.type) {
            case 'Program': 
                return new Program(node.body.map(parseNode))
            case 'Assignment':
                return new Assignment(parseNode(node.target), parseNode(node.value))
            case 'BinaryOp':
                return new BinaryOp(node.op, parseNode(node.left), parseNode(node.right))
            case 'Variable':
                return new Variable(node.name)
            case 'Constant':
                return new Constant(node.val)
            default:
                throw new Error(`Unknown node type: ${node.type}`)
        }
    }

    return parseNode(json)
}