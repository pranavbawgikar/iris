import React, {useState} from "react";
import { parseIR } from "./compiler-core/parser";
import { eliminateCSE, eliminateDeadCode, peepholeOptimize } from "./compiler-core/optimizations";

import { X86CodeGenerator, ArmCodeGenerator } from './compiler-core/codegen'
import TreeVisualization from "./components/TreeVisualization";

export default function App() {
  const [ir, setIR] = useState(null)
  const [optimizations, setOptimizations] = useState({
    cse: true,
    deadCode: true,
    peephole: true,
  })
  const [targetArch, setTargetArch] = useState('x86')
  const [assembly, setAssembly] = useState('')

  const applyOptimizations = (ir) => {
    let optimized = ir
    if(optimizations.cse) optimized = eliminateCSE(optimized)
    if(optimizations.deadCode) optimized = eliminateDeadCode(optimized)
    return optimized
  }

  const generateCode = (ir) => {
    let code
    switch(targetArch) {
      case 'x86':
        code = new X86CodeGenerator().generate(ir)
        break
      case 'arm':
        code = new ArmCodeGenerator().generate(ir)
        break
    }
    return optimizations.peephole ? peepholeOptimize(code) : code
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result)
        const parsedIR = parseIR(json)
        const optimizedIR = applyOptimizations(parsedIR)
        setIR(optimizedIR)
        setAssembly(generateCode(optimizedIR))
      } catch (err) {
        alert(`Error: ${err.message}`)
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="app">
      <div className="controls">
        <input type="file" onChange={handleFileUpload} />

        <label>
          <input type="checkbox" checked={optimizations.cse} onChange={e => setOptimizations({...optimizations, cse: e.target.checked})} />
          Common Subexpression Elimination
        </label>

        <select value={targetArch} onChange={e => setTargetArch(e.target.value)}>
          <option value="x86">x86</option>
          <option value="arm">ARM</option>
        </select>
      </div>

      <div className="output">
        <TreeVisualization ir={ir} />
        <pre className="assembly">{assembly}</pre>
      </div>
    </div>
  )
}