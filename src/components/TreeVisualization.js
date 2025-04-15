import React, { useRef, useEffect } from "react";
import * as d3 from 'd3'
import { type } from "@testing-library/user-event/dist/type";

const NODE_WIDTH = 120
const NODE_HEIGHT = 40
const MARGIN = { top: 20, right: 20, bottom: 20, left: 20 }

export default function TreeVisualization({ ir }) {
    const svgRef = useRef()

    useEffect(() => {
        if(!ir) return

        // Convert class-based IR to plain object for D3
        const convertToD3Hierarchy = (node) => {
            const children = []
            if(node.body) children.push(...node.body.map(convertToD3Hierarchy))
            if(node.left) children.push(convertToD3Hierarchy(node.left))
            if(node.right) children.push(convertToD3Hierarchy(node.right))
            if(node.value) children.push(convertToD3Hierarchy(node.value))

            return {
                type: node.type,
                name: node.name || node.op || node.value?.toString() || '',
                children: children.length ? children : null
            }
        }

        const d3Root = d3.hierarchy(convertToD3Hierarchy(ir))
        const width = 800 - MARGIN.left - MARGIN.right
        const height = 600 - MARGIN.top - MARGIN.bottom
        const treeLayout = d3.tree().size([height, width]).separation(() => 1.2)
        treeLayout(d3Root)

        const svg = d3.select(svgRef.current)
            .html('')
            .attr('width', width + MARGIN.left + MARGIN.right)
            .attr('height', height + MARGIN.top + MARGIN.bottom)
            .append('g')
            .attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`)

        // Draw links
        svg.selectAll('.link')
            .data(d3Root.links())
            .enter()
            .append('path')
            .attr('class', 'link')
            .attr('d', d3.linkHorizontal()
                .x(d => d.y)
                .y(d => d.x))
            .attr('fill', 'none')
            .attr('stroke', '#999')

        // Draw nodes
        const nodes = svg.selectAll('.node')
            .data(d3Root.descendants())
            .enter()
            .append('g')
            .attr('class', 'node')
            .attr('transform', d => `translate(${d.y}, ${d.x})`)
        
        // Node Rectangles
        nodes.append('rect')
            .attr('width', NODE_WIDTH)
            .attr('height', NODE_HEIGHT)
            .attr('rx', 4)
            .attr('fill', d => {
                if(d.data.type === 'BinaryOp') return '#cce5ff'
                if(d.data.type === 'Variable') return '#d4edda'
                if(d.data.type === 'Constant') return '#fff3cd'
            })
            .attr('#f8f9fa')
        
        // Node text
        nodes.append('text')
            .attr('dx', 10)
            .attr('dy', 20)
            .text(d => {
                if(d.data.type === 'BinaryOp') return `OP: ${d.data.op}`
                if(d.data.type === 'Variable') return `VAR: ${d.data.name}`
                if(d.data.type === 'Constant') return `VAL: ${d.data.value}`
                return d.data.type
            })
    }, [ir])
    return <svg ref={svgRef} width={800} height={600} />
}