import { useMemo, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { formatData, setColor, getOption } from "./d3helper";
import * as echarts from "echarts";

const TreeMap = ({ data, selectedOption = "1d" }) => {
  const chartRef = useRef(null);
  //   if (!data) return;

  const options = useMemo(() => {
    if (!data) return null; // Return null or a default value if data is not available
    return getOption(data, setColor, formatData, selectedOption);
  }, [data, selectedOption]);

  useEffect(() => {
    if (!options) return; // Guard clause to handle null or default options

    const chart = echarts.init(chartRef.current);
    chart.setOption(options);

    const handleResize = () => {
      chart.resize();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      chart.dispose();
      window.removeEventListener("resize", handleResize);
    };
  }, [options]);
  if (!data) return null; // Return null or a default value if data is not available

  return (
    <div
      ref={chartRef}
      style={{ height: window.innerHeight - 100, width: "100%" }}
    />
  );
};

TreeMap.propTypes = {
  data: PropTypes.shape({
    children: PropTypes.arrayOf(
      PropTypes.shape({
        change: PropTypes.number,
      })
    ).isRequired,
  }).isRequired,
  selectedOption: PropTypes.string,
};

export default TreeMap;
