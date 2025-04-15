import Ajv from 'ajv'

// IR Nodes
export class IRNode {
    constructor(type) { this.type = type }
}

export class Program extends IRNode {
    constructor(body) {
        super('Program')
        this.body = body
    }
}

export class Assignment extends IRNode {
    constructor(target, value) {
        super('Assignment')
        this.target = target
        this.value = value
    }
}

export class BinaryOp extends IRNode {
    constructor(op, left, right) {
        super('BinaryOp')
        this.op = op
        this.left = left
        this.right = right
        this.id = Symbol('id') // Unique identifier for CSE
    }
}

export class Variable extends IRNode {
    constructor(name) {
        super('Variable')
        this.name = name
    }
}

export class Constant extends IRNode {
    constructor(value) {
        super('Constant')
        this.value = value
    }
}

// JSON Schema Validation using AJV
const ajv = new Ajv()

const irSchema = {
    type: 'object',
    properties: {
        type: { 
            enum: [
                'Program', 
                'Assignment', 
                'BinaryOp', 
                'Variable', 
                'Constant' 
            ] 
        },
        body: { 
            type: 'array', 
            items: { 
                $ref: '#',
            } 
        },
        target: {
            $ref: '#',
        },
        value: {
            $ref: '#',
        },
        op: {
            type: 'string',
        },
        name: {
            type: 'string',
        },
        val: {
            type: 'number',
        },
    },
    required: [ 'type' ]
}

export const validateIR = ajv.compile(irSchema)