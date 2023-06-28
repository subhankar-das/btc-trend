import React, { useState, useEffect, useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { Divider, Select } from "antd";
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

  const loadingOption = {
    text: "Calculating Data ...",
    color: "#4096ff",
    textColor: "#242424",
    maskColor: "rgba(0, 0, 0, 0.4)",
    zlevel: 0,
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

  // method to calculate sum of all elements of an array
  const sumOfArrayValues = (arr) => arr.reduce((acc, val) => acc + val, 0);

  // method to calculate both X and Y
  const calculateBothXandYForLineChart = (fullCsvData, colName) => {
    // for a particular X, get all values of the selected column and find its average
    const uniqueX = {};
    // colname is volumne
    fullCsvData.forEach((obj) => {
      const x = +obj["Unix Timestamp"];
      const y = parseFloat(obj[colName]);
      uniqueX[x] ? (uniqueX[x] = [...uniqueX[x], y]) : (uniqueX[x] = []);
    }); // {volume: 5.6, open: 8.9}
    // console.log(uniqueX);
    // return yValues;
    Object.entries(uniqueX).forEach((arr) => {
      // arr[0] => x value i.e timestamp
      // arr[1] => list of y-values
      // console.log({ v1: arr[0], v2: arr[1] });
      const sumOfElements = sumOfArrayValues(arr[1]);
      const avg =
        sumOfElements === 0 ? 0 : (sumOfElements / arr[1].length).toFixed(2);
      uniqueX[arr[0]] = parseFloat(avg);
    });
    // console.log(uniqueX);
    setXaxisData(Object.keys(uniqueX));
    setYaxisData(Object.values(uniqueX));
  };

  // method to calculate Y-axis values for Line Chart
  const calculateYAxisForLineChart = (fullCsvData, colName) => {
    const yValues = fullCsvData.map((obj) => parseFloat(obj[colName]));
    return yValues;
  };

  // method to calculate X-axis values for Line Chart
  const calculateXAxisForLineChart = (fullCsvData, colName) => {
    const xValues = fullCsvData
      .map((obj) => +obj[colName]) // timestamp
      .sort((a, b) => a - b); // [1450000, 158000 ...]
    return xValues;
  };

  // method to calculate discrete month wise data
  const calculateDiscreteMonth = (fullCsvData, xColName, yColName) => {
    const monthData = {};
    // initialise monthData Object
    Object.values(monthNumberToName).forEach((monthName) => {
      monthData[monthName] = [];
    });
    // {
    //   'Jan': [val1, val2],
    //   'Feb': [val1, val2],
    //   'March': [val1, val2],
    // }
    fullCsvData.forEach((obj) => {
      // 4/22/2023 12:10 => ['4', '22' ..]
      const monthNumber = obj[xColName].split("/")[0]; // get month number
      const monthName = monthNumberToName[monthNumber]; // get month name
      const value = parseFloat(obj[yColName]);
      monthData[monthName].push(value);
    });
    return monthData;
  };

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
      // on interview-change
      // calculateBothXandYForLineChart(csvData, selectColumnValue);
      // old-code to calculate X and Y
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
      }, 500);
    }
  }, [xAxisData, yAxisData]);

  const onChangeColumn = (val) => {
    setColumnValue(val);
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
      <Divider />
      <section className="graph-container">
        {xAxisData.length === 0 || yAxisData.length === 0 ? (
          <></>
        ) : (
          <ReactECharts
            option={{
              title: {
                text: `${
                  graphType === "line" ? "Timestamp" : "Month"
                }-${selectColumnValue} Relation`,
              },
              grid: {
                left: "4%",
                right: "3%",
                bottom: "5%",
              },
              tooltip: {
                trigger: "axis",
              },
              xAxis: {
                type: "category",
                data: xAxisData,
                axisPointer: {
                  label: {
                    formatter: (value) => new Date(+value.value).toDateString(),
                  },
                },
                // name: `${graphType === "line" ? "Timestamp" : "Month"}`,
              },
              yAxis: {
                type: "value",
                // name: `${selectColumnValue}`,
              },
              series: [
                {
                  data: yAxisData,
                  type: graphType,
                  animation: true,
                  draggable: true,
                  showBackground: true,
                  backgroundStyle: {
                    color: "rgba(180, 180, 180, 0.15)",
                  },
                  color: "rgba(64, 150, 255, 0.9)",
                  sampling: "lttb", // Largest triangle three bucket algo to filter points
                },
              ],
              dataZoom: [
                {
                  type: "inside", // zooming
                },
                {
                  type: "slider", // panning
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
