import React from "react";
import ReactECharts from "echarts-for-react";

function RenderGraph() {
  const options = {
    grid: { top: 8, right: 8, bottom: 24, left: 36 },
    xAxis: {
      type: "category",
      data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        data: [820, 932, 901, 934, 1290, 1330, 1320],
        type: "line",
        smooth: true,
      },
    ],
    tooltip: {
      trigger: "axis",
    },
  };
  return (
    <div className="visualization-container">
      <header className="header">Time Series Data Visualization</header>
      <section className="actions-container">
        <button>Columns</button>
        <button>Line</button>
        <button>Bar</button>
      </section>
      <section className="graph-container">
        <ReactECharts option={options} />
      </section>
    </div>
  );
}

export default RenderGraph;
