import React, { useState } from "react";
import ReactECharts from "echarts-for-react";
import { Select } from "antd";

import PropTypes from "prop-types";
function RenderGraph({ csvData, headers }) {
  const nonIncludedHeaders = ["Unix Timestamp", "Date", "Symbol"];
  const columnOptions =
    headers.length > 0
      ? headers
          .filter((header) => !nonIncludedHeaders.includes(header))
          .map((header) => {
            const optionObj = {
              value: header,
              label: `# ${header}`,
              disabled: headers.length === 0,
            };
            return optionObj;
          })
      : [];

  const [columnValue, setColumnValue] = useState("# Open");
  const onChangeColumn = (val) => {
    setColumnValue(val);
  };
  const optionsForGraph = {
    xAxis: {
      type: "category",
      data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        data: [150, 230, 224, 218, 135, 147, 260],
        type: "line",
      },
    ],
  };
  return (
    <div className="visualization-container">
      <header className="header">Time Series Data Visualization</header>
      <section className="actions-container">
        <div className="choose-column">
          <strong>Choose Column:</strong>
          <Select
            defaultValue="# Open"
            value={columnValue}
            style={{ width: 150 }}
            disabled={csvData.length === 0}
            onChange={onChangeColumn}
            options={columnOptions}
          />
        </div>
        <div className="choose-graph-type">
          <strong>Choose Graph Type:</strong>
          <button className="btn line-graph" disabled={headers.length === 0}>
            Line
          </button>
          <button className="btn bar-graph" disabled={headers.length === 0}>
            Bar
          </button>
        </div>
      </section>

      <section className="graph-container">
        <ReactECharts option={optionsForGraph} />
      </section>
    </div>
  );
}

export default RenderGraph;

RenderGraph.propTypes = {
  csvData: PropTypes.array.isRequired,
  headers: PropTypes.array.isRequired,
};
