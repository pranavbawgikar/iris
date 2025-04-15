import { BinaryOp, Constant, Variable } from './ir'

export class ArmCodeGenerator {
    generate(ir) {
        let regCount = 0
        const assembly = []

        function getReg() {
            return `r${regCount++}`
        }

        function traverse(node) {
            if(node instanceof BinaryOp) {
                const leftReg = traverse(node.left)
                const rightReg = traverse(node.right)

                switch(node.op) {
                    case '+':
                        assembly.push(`add ${leftReg}, ${leftReg}, ${rightReg}`)
                        return leftReg
                    case '*':
                        assembly.push(`mul ${leftReg}, ${leftReg}, ${rightReg}`)
                        return leftReg
                }
            } 

            if(node instanceof Constant) {
                const reg = getReg()
                assembly.push(`ldr ${reg}, =${node.value}`)
                return reg
            }

            if(node instanceof Variable) {
                const reg = getReg()
                assembly.push(`ldr ${reg}, [sp, #${node.name}]`)
                return reg
            }
        }

        traverse(ir)
        return assembly.join('\n')
    }
}

export class X86CodeGenerator {
    generate(ir) {
        let assembly = []
        let tempCount = 0

        function getTemp() {
            return `t${tempCount++}`
        }

        function traverse(node) {
            if(node instanceof BinaryOp) {
                const left = traverse(node.left)
                const right = traverse(node.right)
                const temp = getTemp()

                switch(node.op) {
                    case '+':
                        assembly.push(`mov eax, ${left}`)
                        assembly.push(`add eax, ${right}`)
                        break
                    case '*':
                        assembly.push(`mov eax, ${left}`)
                        assembly.push(`imul eax, ${right}`)
                        break
                }
                assembly.push(`mov ${temp}, eax`)
                return temp
            }

            if(node instanceof Constant) {
                return node.value.toString()
            }

            if(node instanceof Variable) {
                return `[${node.name}]`
            }
        }

        traverse(ir)
        return assembly.join('\n')
    }
}