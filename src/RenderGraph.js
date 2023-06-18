import React, { useState, useEffect, useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { Select } from "antd";
import PropTypes from "prop-types";
function RenderGraph({ csvData, headers }) {
  const monthNumberToName = {
    1: "January",
    2: "February",
    3: "March",
    4: "April",
    5: "May",
    6: "June",
    7: "July",
    8: "August",
    9: "September",
    10: "October",
    11: "November",
    12: "December",
  };
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

  const [selectColumnValue, setColumnValue] = useState("Open");
  const [xAxisData, setXaxisData] = useState([]);
  const [yAxisData, setYaxisData] = useState([]);
  const [graphType, setGraphType] = useState("line");
  const [isGraphLoading, setGraphLoading] = useState(false);

  // method to calculate Y-axis values for Line Chart
  const calculateYAxisForLineChart = (fullCsvData, colName) => {
    const yValues = fullCsvData.map((obj) => parseFloat(obj[colName]));
    return yValues;
  };

  // method to calculate X-axis values for Line Chart
  const calculateXAxisForLineChart = (fullCsvData, colName) => {
    const xValues = fullCsvData
      .map((obj) => +obj[colName])
      .sort((a, b) => a - b);
    return xValues;
  };

  // method to calculate discrete month wise data
  const calculateDiscreteMonth = (fullCsvData, xColName, yColName) => {
    const monthData = {};
    // initialise monthData Object
    Object.values(monthNumberToName).forEach((monthName) => {
      monthData[monthName] = [];
    });
    fullCsvData.forEach((obj) => {
      const monthNumber = obj[xColName].split("/")[0]; // get month number
      const monthName = monthNumberToName[monthNumber]; // get month name
      const value = parseFloat(obj[yColName]);
      monthData[monthName].push(value);
    });
    return monthData;
  };

  // method to calculate sum of all elements of an array
  const sumOfArrayValues = (arr) => arr.reduce((acc, val) => acc + val, 0);

  // method to calculate Y-axis values for Bar Chart
  const calculateAxesForBarChart = (monthWiseData) => {
    const monthWiseAvg = {};
    const arrayOfData = Object.entries(monthWiseData);
    arrayOfData.forEach((arr) => {
      // arr[0] => month name
      // arr[1] => an array of values for a particular month
      const sumOfElements = sumOfArrayValues(arr[1]);
      const avg =
        sumOfElements === 0 ? 0 : (sumOfElements / arr[1].length).toFixed(2);
      monthWiseAvg[arr[0]] = parseFloat(avg);
    });
    return monthWiseAvg;
  };

  const calculatePlotData = (csvData, graphType, selectColumnValue) => {
    // empty existing data points
    setXaxisData([]);
    setYaxisData([]);
    if (graphType === "line") {
      // calculate Y
      const yVals = calculateYAxisForLineChart(csvData, selectColumnValue);
      setYaxisData(yVals);
      // calculate X
      const xVals = calculateXAxisForLineChart(csvData, "Unix Timestamp");
      setXaxisData(xVals);
    } else if (graphType === "bar") {
      const monthWiseData = calculateDiscreteMonth(
        csvData,
        "Date",
        selectColumnValue
      );
      // calculate both axes
      const monthWiseAverage = calculateAxesForBarChart(monthWiseData);
      setYaxisData(Object.values(monthWiseAverage));
      setXaxisData(Object.keys(monthWiseAverage));
    }
  };

  useMemo(() => {
    if (csvData.length > 0) {
      setGraphLoading(true);
      calculatePlotData(csvData, graphType, selectColumnValue);
    }
    //eslint-disable-next-line
  }, [csvData, graphType, selectColumnValue]);

  useEffect(() => {
    if (xAxisData.length > 0 && yAxisData.length > 0) {
      setTimeout(() => {
        setGraphLoading(false);
      }, 200);
    }
  }, [xAxisData, yAxisData]);

  const onChangeColumn = (val) => {
    setColumnValue(val);
  };

  const loadingOption = {
    text: "Calculating Data ...",
    color: "#4096ff",
    textColor: "#242424",
    maskColor: "rgba(0, 0, 0, 0.4)",
    zlevel: 0,
  };

  const onSelectGraph = (type) => {
    setGraphType(type);
  };

  return (
    <div className="visualization-container">
      <header className="header">Time Series Data Visualization</header>
      <section className="actions-container">
        <div className="choose-column">
          <strong>Choose Column:</strong>
          <Select
            defaultValue="# Open"
            value={selectColumnValue}
            style={{ width: 150 }}
            disabled={csvData.length === 0}
            onChange={onChangeColumn}
            options={columnOptions}
          />
        </div>
        <div className="choose-graph-type">
          <strong>Choose Graph Type:</strong>
          <button
            className="btn line-graph"
            disabled={headers.length === 0}
            style={{
              backgroundColor: graphType === "line" ? "#4096ff" : "#dcdcdc",
            }}
            onClick={() => onSelectGraph("line")}
          >
            Line
          </button>
          <button
            className="btn bar-graph"
            style={{
              backgroundColor: graphType === "bar" ? "#4096ff" : "#dcdcdc",
            }}
            disabled={headers.length === 0}
            onClick={() => onSelectGraph("bar")}
          >
            Bar
          </button>
        </div>
      </section>

      <section className="graph-container">
        {xAxisData.length === 0 || yAxisData.length === 0 ? (
          <></>
        ) : (
          <ReactECharts
            option={{
              grid: {
                left: "5%",
                right: "5%",
                bottom: "10%",
              },
              tooltip: {
                trigger: "axis",
              },
              xAxis: {
                type: "category",
                data: xAxisData,
              },
              yAxis: {
                type: "value",
              },
              series: [
                {
                  data: yAxisData,
                  type: graphType,
                  animation: true,
                  draggable: true,
                  showBackground: true,
                  backgroundStyle: {
                    color: "rgba(180, 180, 180, 0.3)",
                  },
                  color: "rgba(64, 150, 255, 0.9)",
                  sampling: "lttb",
                },
              ],
              dataZoom: [
                {
                  type: "inside", // Enable zooming
                },
                {
                  type: "slider", // Enable panning
                },
              ],
            }}
            loadingOption={loadingOption}
            showLoading={isGraphLoading}
            lazyUpdate={true}
            style={{ height: 450 }}
          />
        )}
      </section>
    </div>
  );
}

export default RenderGraph;

RenderGraph.propTypes = {
  csvData: PropTypes.array.isRequired,
  headers: PropTypes.array.isRequired,
};
