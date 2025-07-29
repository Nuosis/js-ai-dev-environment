import React from 'react';

/**
 * TimeFormatToggle component for switching between hr:mm and decimal time formats
 */
function TimeFormatToggle({ timeFormat, onToggle }) {
  const handleToggle = (e) => {
    const newFormat = e.target.checked ? 'hhmm' : 'decimal';
    onToggle(newFormat);
  };

  const isChecked = timeFormat === 'hhmm';
  const toggleClass = `toggle-switch ${isChecked ? 'checked' : ''}`;

  return (
    <div className="time-format-toggle">
      <label className="toggle-label">
        <span className="toggle-text">Time Format:</span>
        <div className={toggleClass}>
          <input
            type="checkbox"
            checked={isChecked}
            onChange={handleToggle}
            className="toggle-input"
          />
          <span
            className="toggle-slider"
            style={{
              '--slider-transform': isChecked ? 'translateX(100%)' : 'translateX(0%)'
            }}
          >
            <span
              className="toggle-option left"
              style={{
                color: isChecked ? 'rgba(255, 255, 255, 0.6)' : '#667eea',
                fontWeight: isChecked ? '500' : '600'
              }}
            >
              Decimal
            </span>
            <span
              className="toggle-option right"
              style={{
                color: isChecked ? '#667eea' : 'rgba(255, 255, 255, 0.8)',
                fontWeight: isChecked ? '600' : '500'
              }}
            >
              Hr:Min
            </span>
          </span>
        </div>
      </label>
    </div>
  );
}

export default TimeFormatToggle;