import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { createDateRange } from '../services/timezoneService';

/**
 * DateRangePicker component for selecting date ranges
 */
function DateRangePicker({ onDateRangeSubmit, loading }) {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    if (startDate > endDate) {
      setError('Start date must be before end date');
      return;
    }

    // Use timezone service for consistent date handling
    const dateRange = createDateRange(startDate, endDate);
    onDateRangeSubmit(dateRange);
  };

  return (
    <div className="date-range-picker">
      <h2>Select Date Range for Timecard Data</h2>
      <form onSubmit={handleSubmit} className="date-range-form">
        <div className="date-input-group">
          <div className="date-input">
            <label htmlFor="start-date">Start Date:</label>
            <DatePicker
              id="start-date"
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              placeholderText="Select start date"
              dateFormat="yyyy-MM-dd"
              disabled={loading}
              required
              className="date-picker-input"
            />
          </div>
          <div className="date-input">
            <label htmlFor="end-date">End Date:</label>
            <DatePicker
              id="end-date"
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              placeholderText="Select end date"
              dateFormat="yyyy-MM-dd"
              disabled={loading}
              required
              className="date-picker-input"
            />
          </div>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <button 
          type="submit" 
          className="submit-button"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Load Timecard Data'}
        </button>
      </form>
    </div>
  );
}

export default DateRangePicker;