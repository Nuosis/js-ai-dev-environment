import React, { useState, useMemo } from "react";
import {
  getLocalDateFromDateTime,
  getLocalTimeFromDateTime,
  calculateLocalHours,
  getLocalWeekStart,
  formatDateStringForUSDisplay,
  formatDateRangeForUSDisplay
} from '../services/timezoneService';

/**
 * TimecardWidget component for displaying timecard data with employee cards and weekly summaries
 */
function TimecardWidget({ data, dateRange, timeFormat = 'decimal' }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedWeeks, setExpandedWeeks] = useState({});
  // console.log("timecard loadConfigFromFile... ",data)

  // Helper function to round to nearest 15 minutes
  const roundToQuarter = (hours) => {
    return Math.round(hours * 4) / 4;
  };

  // Helper function to format time based on toggle
  const formatTime = (hours) => {
    if (timeFormat === 'hhmm') {
      const wholeHours = Math.floor(hours);
      const minutes = Math.round((hours - wholeHours) * 60);
      return `${wholeHours}:${minutes.toString().padStart(2, '0')}`;
    }
    return hours.toFixed(2);
  };

  // All date/time helper functions now use the timezone service for consistent handling

  // Process and group data by employee and week
  const processedData = useMemo(() => {
    if (!data || !Array.isArray(data)) return {};

    const employeeData = {};

    data.forEach(record => {
      const fieldData = record.fieldData;
      
      // Basic validation - skip records with missing essential data
      if (!fieldData || !fieldData.Name || !fieldData.DateTimeIn) {
        console.warn('Skipping record with missing essential data:', record);
        return;
      }

      const employeeName = fieldData.Name;
      const dateTimeIn = fieldData.DateTimeIn;
      const dateTimeOut = fieldData.DateTimeOut;
      const dayOfWeek = fieldData.DayOfWeek || '';
      const date = getLocalDateFromDateTime(dateTimeIn);
      const totalHours = calculateLocalHours(dateTimeIn, dateTimeOut);
      const weekStart = getLocalWeekStart(date);

      if (!employeeData[employeeName]) {
        employeeData[employeeName] = {
          name: employeeName,
          weeks: {},
          totalRegular: 0,
          totalOvertime: 0,
          totalHours: 0
        };
      }

      if (!employeeData[employeeName].weeks[weekStart]) {
        employeeData[employeeName].weeks[weekStart] = {
          weekStart,
          records: [],
          totalHours: 0,
          regularHours: 0,
          overtimeHours: 0
        };
      }

      employeeData[employeeName].weeks[weekStart].records.push({
        ...fieldData,
        date,
        totalHours,
        timeIn: getLocalTimeFromDateTime(dateTimeIn),
        timeOut: getLocalTimeFromDateTime(dateTimeOut),
        DayOfWeek: dayOfWeek
      });
      employeeData[employeeName].weeks[weekStart].totalHours += totalHours;
    });

    // Calculate regular/overtime for each week and employee totals
    Object.values(employeeData).forEach(employee => {
      Object.values(employee.weeks).forEach(week => {
        const weekTotal = week.totalHours;
        week.regularHours = Math.min(weekTotal, 40);
        week.overtimeHours = Math.max(weekTotal - 40, 0);
        
        // Round to nearest 15 minutes for summaries
        week.regularHours = roundToQuarter(week.regularHours);
        week.overtimeHours = roundToQuarter(week.overtimeHours);
        
        employee.totalRegular += week.regularHours;
        employee.totalOvertime += week.overtimeHours;
        employee.totalHours += week.regularHours + week.overtimeHours;
      });
    });

    return employeeData;
  }, [data]);

  // Filter employees based on search term
  const filteredEmployees = useMemo(() => {
    if (!searchTerm) return Object.values(processedData);
    return Object.values(processedData).filter(employee =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [processedData, searchTerm]);

  // Calculate overall totals
  const overallTotals = useMemo(() => {
    return filteredEmployees.reduce((acc, employee) => ({
      totalLabor: acc.totalLabor + employee.totalHours,
      totalOvertime: acc.totalOvertime + employee.totalOvertime
    }), { totalLabor: 0, totalOvertime: 0 });
  }, [filteredEmployees]);

  const toggleWeekExpansion = (employeeName, weekStart) => {
    const key = `${employeeName}-${weekStart}`;
    setExpandedWeeks(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (!data || data.length === 0) {
    return (
      <div className="timecard-widget">
        <p>No timecard data available.</p>
      </div>
    );
  }

  return (
    <div className="timecard-widget">
      {/* Header Section */}
      <div className="header-section">
        <div className="stats-section">
          <div className="stat-item">
            <span className="stat-label">Total Labor:</span>
            <span className="stat-value">{formatTime(roundToQuarter(overallTotals.totalLabor))}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Overtime:</span>
            <span className="stat-value">{formatTime(roundToQuarter(overallTotals.totalOvertime))}</span>
          </div>
          {dateRange && (
            <div className="stat-item">
              <span className="stat-label">Pay Period:</span>
              <span className="stat-value">{formatDateRangeForUSDisplay(dateRange.startDate, dateRange.endDate)}</span>
            </div>
          )}
        </div>
        
        <div className="search-section">
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Employee Cards */}
      <div className="employee-cards">
        {filteredEmployees.map(employee => (
          <div key={employee.name} className="employee-card">
            <div className="employee-header">
              <h3 className="employee-name">{employee.name}</h3>
              <div className="employee-totals">
                <span className="total-hours">
                  Total: {formatTime(roundToQuarter(employee.totalHours))}
                </span>
                <span className="regular-hours">
                  Regular: {formatTime(roundToQuarter(employee.totalRegular))}
                </span>
                <span className="overtime-hours">
                  Overtime: {formatTime(roundToQuarter(employee.totalOvertime))}
                </span>
              </div>
            </div>

            <div className="weekly-summaries">
              {Object.values(employee.weeks)
                .sort((a, b) => new Date(a.weekStart) - new Date(b.weekStart))
                .map(week => {
                  const weekKey = `${employee.name}-${week.weekStart}`;
                  const isExpanded = expandedWeeks[weekKey];
                  const weekEndDate = new Date(week.weekStart);
                  weekEndDate.setDate(weekEndDate.getDate() + 6);
                  
                  return (
                    <div key={week.weekStart} className="week-summary">
                      <div
                        className="week-header"
                        onClick={() => toggleWeekExpansion(employee.name, week.weekStart)}
                      >
                        <span className="week-dates">
                          Week of {formatDateStringForUSDisplay(week.weekStart)} - {formatDateStringForUSDisplay(weekEndDate.toISOString().split('T')[0])}
                        </span>
                        <div className="week-totals">
                          <span className="week-regular">
                            Reg: {formatTime(week.regularHours)}
                          </span>
                          <span className="week-overtime">
                            OT: {formatTime(week.overtimeHours)}
                          </span>
                        </div>
                        <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>▼</span>
                      </div>

                      {isExpanded && (
                        <div className="week-details">
                          {week.records
                            .sort((a, b) => new Date(a.date) - new Date(b.date))
                            .map((record, index) => (
                              <div key={index} className="day-record">
                                <div className="day-left-group">
                                  <span className="day-info">
                                    {record.DayOfWeek}
                                  </span>
                                  <span className="day-date">
                                    {formatDateStringForUSDisplay(record.date)}
                                  </span>
                                  <span className="day-times">
                                    {record.timeIn} - {record.timeOut}
                                  </span>
                                </div>
                                <span className="day-hours">
                                  {formatTime(record.totalHours)} hrs
                                </span>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TimecardWidget;