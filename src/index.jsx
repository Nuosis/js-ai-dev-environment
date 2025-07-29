import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import FMGofer from 'fm-gofer';
import Spinner from "./components/Spinner";
import TimecardWidget from "./components/TimecardWidget";
import DateRangePicker from "./components/DateRangePicker";
import TimeFormatToggle from "./components/TimeFormatToggle";
import { exportToPDF } from "./services/pdfExportService";

/**
 * Main App component for the Timecard Widget
 */
function App() {
  const [loading, setLoading] = useState(false);
  const [timecardData, setTimecardData] = useState(null);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [timeFormat, setTimeFormat] = useState('decimal');
  const [showDatePicker, setShowDatePicker] = useState(true);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportMessage, setExportMessage] = useState(null);

  const handleTimeFormatChange = (newFormat) => {
    setTimeFormat(newFormat);
  };

  // No need for callback registration with direct FileMaker pattern

  const handleDateRangeSubmit = async (selectedDateRange) => {
    setDateRange(selectedDateRange);
    setLoading(true);
    setError(null);
    setShowDatePicker(false);

    // Create query in the format expected by FileMaker
    const query = {
      action: "read",
      dateformats: "1",
      layouts: "TimeClock",
      query: [{
        TimeInDate: `${selectedDateRange.formattedStartDate}...${selectedDateRange.formattedEndDate}`
      }],
      version: "vLatest"
    };

    //Check if FileMaker is available, otherwise use sample data
    if (typeof FileMaker === 'undefined') {
      // Use sample data for browser testing
      setTimeout(() => {
        setLoading(false);
        // Load sample data from exampleData.json
        fetch('/exampleData.json')
          .then(response => response.json())
          .then(data => {
            setTimecardData(data.response.data);
          })
          .catch((err) => {
            console.error('Failed to load example data:', err);
            setError('Failed to load example data');
          });
      }, 1000);
    } else {
      try {
        //Make async call to FileMaker to get timecard data using FMGofer directly
        const result = await FMGofer.PerformScript('js * fetchData', JSON.stringify(query));

        // console.log("Raw FileMaker result:", result);

        const data = JSON.parse(result);

        setTimecardData(data.response?.data);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        setError(err.message || 'An error occurred while fetching timecard data');
      }
    }
  };

  const handleNewDateRange = () => {
    setShowDatePicker(true);
    setTimecardData(null);
    setError(null);
    setDateRange(null);
    setExportMessage(null);
  };

  const handleExportPDF = async () => {
    if (!timecardData || timecardData.length === 0) {
      setExportMessage({ type: 'error', text: 'No timecard data available to export' });
      return;
    }

    setExportingPDF(true);
    setExportMessage(null);

    try {
      await exportToPDF(timecardData, dateRange, timeFormat);
      setExportMessage({ type: 'success', text: 'PDF export completed successfully' });
    } catch (error) {
      console.error('PDF export failed:', error);
      setExportMessage({
        type: 'error',
        text: error.message || 'Failed to export PDF. Please try again.'
      });
    } finally {
      setExportingPDF(false);
      // Clear the message after 5 seconds
      setTimeout(() => setExportMessage(null), 5000);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Timecard Widget</h1>
        {!showDatePicker && (
          <div className="header-controls">
            <TimeFormatToggle
              timeFormat={timeFormat}
              onToggle={handleTimeFormatChange}
            />
            <button
              onClick={handleExportPDF}
              className="export-pdf-button"
              disabled={exportingPDF || !timecardData}
            >
              {exportingPDF ? 'Exporting...' : 'Export PDF'}
            </button>
            <button
              onClick={handleNewDateRange}
              className="new-range-button"
            >
              New Date Range
            </button>
          </div>
        )}
      </header>
      
      {exportMessage && (
        <div className={`export-message ${exportMessage.type}`}>
          {exportMessage.text}
        </div>
      )}
      
      {showDatePicker ? (
        <DateRangePicker
          onDateRangeSubmit={handleDateRangeSubmit}
          loading={loading}
        />
      ) : loading ? (
        <div className="loading-container">
          <div id="spinner-container"></div>
          <p>Loading timecard data...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={handleNewDateRange} className="retry-button">
            Try Different Date Range
          </button>
        </div>
      ) : (
        <TimecardWidget
          data={timecardData}
          dateRange={dateRange}
          timeFormat={timeFormat}
        />
      )}
    </div>
  );
}

// Initialize the React app
const rootElement = document.getElementById("root");
const root = createRoot(rootElement);
root.render(<App />);

// Log version
console.log("v.1.0.0 - Timecard Widget");