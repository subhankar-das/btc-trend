import "./App.css";
import RenderGraph from "./RenderGraph";
function BTCContainer() {
  const dataset = `Unix Timestamp,Date,Symbol,Open,High,Low,Close,Volume
1.61888E+12,4/20/2021 0:02,BTCUSD,55717.47,55723,55541.69,55541.69,2.406733604
1.61888E+12,4/20/2021 0:01,BTCUSD,55768.94,55849.82,55711.74,55717.47,0.5734577
1.61888E+12,4/20/2021 0:00,BTCUSD,55691.79,55793.15,55691.79,55768.94,3.309903747
1.61683E+12,3/27/2021 7:12,BTCUSD,55007,55030.9,55007,55028.07,0.09001
1.61683E+12,3/27/2021 7:11,BTCUSD,55039.76,55039.76,54989.28,55007,7.70254363
1.61683E+12,3/27/2021 7:10,BTCUSD,55037.8,55039.76,55037.8,55039.76,0.00090534
1.61683E+12,3/27/2021 7:09,BTCUSD,55091.53,55091.53,55037.8,55037.8,0.523349722`;

  // Parse the dataset
  const rows = dataset.split("\n");
  const headers = rows[0].split(",");
  const data = rows.slice(1).map((row) => {
    const values = row.split(",");
    const rowData = {};
    for (let i = 0; i < headers.length; i++) {
      rowData[headers[i]] = values[i];
    }
    return rowData;
  });

  // Extract month and count occurrences
  const monthCount = {};
  for (let i = 0; i < data.length; i++) {
    const date = new Date(data[i].Date);
    const month = date.toLocaleString("default", { month: "short" });
    monthCount[month] = (monthCount[month] || 0) + 1;
  }

  // Prepare data for chart
  const labels = Object.keys(monthCount);
  const values = Object.values(monthCount);
  console.log({ labels, values });

  return (
    <div className="parent-container">
      {/* parent is responsible for initialising data */}
      <section className="upload-container">
        <button>Upload CSV</button>
      </section>

      {/* pass initialised data to child */}
      <section className="child-container">
        <RenderGraph />
      </section>
    </div>
  );
}

export default BTCContainer;
