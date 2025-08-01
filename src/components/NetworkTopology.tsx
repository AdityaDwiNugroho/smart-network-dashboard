import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Device } from '@/types';

interface NetworkConnection {
  source: string;
  target: string;
  bandwidth?: {
    upload: number;
    download: number;
  };
  latency?: number;
}

interface NetworkTopologyProps {
  devices: Device[];
  connections: NetworkConnection[];
}

interface SimNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: string;
}

export function NetworkTopology({ devices, connections }: NetworkTopologyProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !devices.length) return;

    const width = 800;
    const height = 600;

    // Clear previous visualization
    d3.select(svgRef.current).selectAll("*").remove();

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Convert devices to simulation nodes
    const nodes: SimNode[] = devices.map(d => ({
      id: d.id,
      name: d.name,
      type: d.type,
      x: undefined,
      y: undefined,
      index: undefined
    }));

    // Convert connections to simulation links
    const links = connections.map(c => ({
      source: nodes.find(n => n.id === c.source)!,
      target: nodes.find(n => n.id === c.target)!,
      bandwidth: c.bandwidth,
      latency: c.latency
    }));

    // Create force simulation
    const simulation = d3.forceSimulation<SimNode>(nodes)
      .force('link', d3.forceLink<SimNode, d3.SimulationLinkDatum<SimNode>>(links)
        .id(d => d.id)
        .distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2));

    // Draw connections
    const linkElements = svg.append('g')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', d => {
        const bandwidth = (d as any).bandwidth;
        return Math.sqrt((bandwidth?.upload || 0) + (bandwidth?.download || 0) || 1);
      });

    // Create device nodes
    const nodeElements = svg.append('g')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .call(d3.drag<SVGGElement, SimNode>()
        .on('start', dragStarted)
        .on('drag', dragged)
        .on('end', dragEnded));

    // Add circles for devices
    nodeElements.append('circle')
      .attr('r', 20)
      .attr('fill', (d) => getDeviceColor(d.type));

    // Add device labels
    nodeElements.append('text')
      .text((d) => d.name)
      .attr('text-anchor', 'middle')
      .attr('dy', 30);

    // Add tooltips
    nodeElements.append('title')
      .text((d) => `${d.name}\n${devices.find(device => device.id === d.id)?.ipAddress}`);

    // Update positions on simulation tick
    simulation.on('tick', () => {
      linkElements
        .attr('x1', d => (d.source as SimNode).x!)
        .attr('y1', d => (d.source as SimNode).y!)
        .attr('x2', d => (d.target as SimNode).x!)
        .attr('y2', d => (d.target as SimNode).y!);

      nodeElements
        .attr('transform', d => `translate(${d.x || 0},${d.y || 0})`);
    });

    // Drag functions
    function dragStarted(event: d3.D3DragEvent<SVGGElement, SimNode, SimNode>) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, SimNode, SimNode>) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragEnded(event: d3.D3DragEvent<SVGGElement, SimNode, SimNode>) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [devices, connections]);

  function getDeviceColor(type: string): string {
    switch (type) {
      case 'router':
        return '#ff7f0e';
      case 'switch':
        return '#1f77b4';
      case 'accessPoint':
        return '#2ca02c';
      default:
        return '#7f7f7f';
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Network Topology</h3>
      <div className="relative w-full h-[600px]">
        <svg
          ref={svgRef}
          className="w-full h-full"
          viewBox="0 0 800 600"
          preserveAspectRatio="xMidYMid meet"
        />
      </div>
    </div>
  );
}
