import { BinaryOp, Constant, Variable, Program, Assignment } from "./ir"

// Common Subexpression Elimination
export function eliminateCSE(ir) {
    const exprMap = new Map()

    function traverse(node) {
        if(node instanceof BinaryOp) {
            const left = traverse(node.left)
            const right = traverse(node.right)
            const key = `${node.op} | ${left.id} | ${right.id}`

            if(exprMap.has(key)) {
                return exprMap.get(key)
            } else {
                exprMap.set(key, node)
                return node
            }
        }
        return node
    }
    return traverse(ir)
}

// Dead Code Elimination
export function eliminateDeadCode(ir) {
    const usedVariables = new Set()

    function findUsages(node) {
        if (node instanceof Variable) usedVariables.add(node.name)
        if (node.left) findUsages(node.left)
        if (node.right) findUsages(node.right)
        if (node.value) findUsages(node.value)
    }

    function traverse(node) {
        if(node instanceof Program) {
            node.body = node.body.filter(stmt => {
                if(stmt instanceof Assignment) {
                    findUsages(stmt.value)
                    return usedVariables.has(stmt.target.name)
                }
                return true
            })
        }
        return node
    }
    return traverse(ir)
}

// Peephole Optimization
export function peepholeOptimize(assembly) {
    return assembly
        .replace(/mov eax, eax\n/g, '') // Remove redundant moves
        .replace(/add eax, 0\n/g, '') // Remove useless adds
        .replace(/mul 2\n/g, 'shl eax, 1\n') // Replace multiply with shift
}