import PropTypes from "prop-types";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  select,
  hierarchy,
  treemap,
  scaleOrdinal,
  schemeCategory10,
  zoom,
  pointer,
} from "d3";
import { debounce } from "lodash";

const D3Treemap = ({ data, error }) => {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const containerRef = useRef(null);
  const [currentZoom, setCurrentZoom] = useState(null);
  const [tooltipData, setTooltipData] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const getPerformanceColor = useCallback((change) => {
    if (change >= 2) return "#019a11";
    if (change >= 1) return "#35d24b";
    if (change >= -1) return "#959595";
    if (change >= -2) return "#FF4747";
    return "#ff0000";
  }, []);

  const updateTooltipPosition = useCallback((event) => {
    if (!containerRef.current || !tooltipRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const [mouseX, mouseY] = pointer(event, containerRef.current);

    let x = mouseX + 10;
    let y = mouseY - 10;

    // Adjust x-position if tooltip goes beyond right edge
    if (x + tooltipRect.width > containerRect.width) {
      x = mouseX - tooltipRect.width - 10;
    }

    // Adjust y-position if tooltip goes beyond bottom edge
    if (y + tooltipRect.height > containerRect.height) {
      y = mouseY - tooltipRect.height - 10;
    }

    // Ensure tooltip doesn't go beyond left or top edges
    x = Math.max(0, x);
    y = Math.max(0, y);

    setTooltipPosition({ x, y });
  }, []);

  useEffect(() => {
    if (!data) return;

    const width = window.innerWidth - 100;
    const height = window.innerHeight - 50;

    const svg = select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`);

    svg.selectAll("*").remove();

    const g = svg.append("g");

    const root = hierarchy(data)
      .sum((d) => d.value)
      .sort((a, b) => b.value - a.value);

    const tree = treemap()
      .size([width, height])
      .paddingTop(28)
      .paddingInner(3)
      .round(true);

    tree(root);

    const sectorColorScale = scaleOrdinal(schemeCategory10);

    const sections = g
      .selectAll(".section")
      .data(root.children)
      .enter()
      .append("g")
      .attr("class", "section");

    sections
      .append("rect")
      .attr("x", (d) => d.x0)
      .attr("y", (d) => d.y0)
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", (d) => d.y1 - d.y0)
      .attr("fill", (d) => sectorColorScale(d.data.name))
      .attr("fill-opacity", 0.25)
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);

    sections
      .append("text")
      .attr("x", (d) => d.x0 + 5)
      .attr("y", (d) => d.y0 + 20)
      .attr("fill", "#000")
      .attr("font-weight", "bold")
      .attr("font-size", "14px")
      .text((d) => d.data.name);

    const cell = sections
      .selectAll("g")
      .data((d) => d.leaves())
      .join("g")
      .attr("transform", (d) => `translate(${d.x0},${d.y0})`);

    cell
      .append("rect")
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", (d) => d.y1 - d.y0)
      .attr("fill", (d) => getPerformanceColor(d.data.changes["1d"]))
      .attr("stroke", "#fff")
      .on("mouseenter", function (event, d) {
        select(this).attr("stroke", "#000");
        setTooltipData(d);
        updateTooltipPosition(event);
      })
      .on("mousemove", updateTooltipPosition)
      .on("mouseleave", function () {
        select(this).attr("stroke", "#fff");
        setTooltipData(null);
      });

    const labels = cell
      .append("text")
      .attr("class", "cell-label")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", "#000");

    function updateLabels() {
      labels.each(function (d) {
        const node = select(this);
        const cellWidth = d.x1 - d.x0;
        const cellHeight = d.y1 - d.y0;
        const padding = 4;
        const availableWidth = cellWidth - padding * 2;
        const availableHeight = cellHeight - padding * 2;

        let fontSize = Math.min(
          availableWidth / Math.sqrt(d.data.symbol.length),
          availableHeight / 2,
          14
        );

        while (fontSize > 4) {
          node
            .attr("font-size", `${fontSize}px`)
            .attr("x", cellWidth / 2)
            .attr("y", cellHeight / 2)
            .text(d.data.symbol);

          const textWidth = node.node().getBBox().width;
          const textHeight = node.node().getBBox().height;

          if (textWidth <= availableWidth && textHeight <= availableHeight) {
            node.attr("opacity", 1);
            break;
          }

          fontSize -= 1;
        }

        if (fontSize <= 4) {
          node.attr("opacity", 0);
        }
      });
    }

    const debouncedUpdateLabels = debounce(updateLabels, 100);

    function handleZoom(event) {
      const { transform } = event;
      g.attr("transform", transform);
      debouncedUpdateLabels();
      setCurrentZoom(root);
    }

    const z = zoom()
      .scaleExtent([1, 8])
      .translateExtent([
        [0, 0],
        [width, height],
      ])
      .extent([
        [0, 0],
        [width, height],
      ])
      .on("zoom", handleZoom);

    svg.call(z);

    setCurrentZoom(root);

    updateLabels();

    const handleResize = debounce(() => {
      const newWidth = window.innerWidth - 100;
      const newHeight = window.innerHeight - 50;
      svg.attr("width", newWidth).attr("height", newHeight);
      tree.size([newWidth, newHeight]);
      tree(root);
      updateLabels();
    }, 100);

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [data, getPerformanceColor, updateTooltipPosition]);

  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <div
      ref={containerRef}
      className="treemap-container"
      style={{
        display: "flex",
        justifyContent: "center",
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <svg ref={svgRef}></svg>
      {currentZoom && currentZoom.depth > 0 && (
        <div className="current-selection">
          <h3>Current Selection: {currentZoom.data.name}</h3>
        </div>
      )}
      {tooltipData && (
        <div
          ref={tooltipRef}
          style={{
            position: "absolute",
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            backgroundColor: "white",
            border: "1px solid black",
            borderRadius: "5px",
            padding: "10px",
            pointerEvents: "none",
            zIndex: 1000,
            transition: "left 0.1s, top 0.1s",
            maxWidth: "200px",
            wordWrap: "break-word",
          }}
        >
          <strong>{tooltipData.data.name}</strong>
          <br />
          <strong>{tooltipData.data.symbol}</strong>
          <br />
          Sector: {tooltipData.parent.data.name}
          <br />
          1D Change: {tooltipData.data.changes["1d"].toFixed(2)}%
        </div>
      )}
    </div>
  );
};
D3Treemap.propTypes = {
  data: PropTypes.shape({}),
  error: PropTypes.string,
};

export default D3Treemap;
