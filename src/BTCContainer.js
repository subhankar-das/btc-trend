import "./App.css";
import { useState } from "react";
import { Upload, Button } from "antd";
import { UploadOutlined, LoadingOutlined } from "@ant-design/icons";
import Papa from "papaparse";
import RenderGraph from "./RenderGraph";

function BTCContainer() {
  // const [uploadedFile, setUploadedFile] = useState({});
  const [csvData, setCSVData] = useState([]);
  const [isParsingCSVFile, setParsingCSVFile] = useState(false);

  const parseCsv = (fileObj) => {
    setParsingCSVFile(true);
    Papa.parse(fileObj, {
      skipEmptyLines: true,
      header: true, //get array of objects
      complete: (results) => {
        setParsingCSVFile(false);
        setCSVData(results.data);
        console.log("post parse:", results.data);
      },
    });
  };

  const onUpload = ({ file, fileList }) => {
    // setUploadedFile(file);
    // if fileList contains a file, parse it
    // in case file is removed, fileList is empty => donot parse
    if (fileList.length > 0) {
      parseCsv(file);
    }
  };

  return (
    <div className="parent-container">
      {/* parent is responsible for initialising data */}
      <section className="upload-container">
        <Upload
          accept=".csv"
          maxCount={1}
          multiple={false}
          beforeUpload={(file) => {
            const reader = new FileReader();
            reader.readAsText(file);
            // Prevent upload
            return false;
          }}
          onChange={onUpload}
        >
          <Button
            className="upload-btn"
            disabled={isParsingCSVFile}
            icon={isParsingCSVFile ? <LoadingOutlined /> : <UploadOutlined />}
          >
            {isParsingCSVFile
              ? `Parsing uploaded file`
              : `Upload your data-set`}
          </Button>
        </Upload>
      </section>

      {/* pass initialised data to child */}
      <section className="child-container">
        <RenderGraph csvData={csvData} />
      </section>
    </div>
  );
}

export default BTCContainer;
