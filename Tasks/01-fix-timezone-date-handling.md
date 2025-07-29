# Task 01: Fix Timezone Date Handling

## 🎯 Objective
Fix the UTC/timezone conversion issues causing incorrect date filtering where records from July 13th appear when filtering for July 14th-31st.

## 🔍 Problem Description
The application has mixed timezone handling:
- Date range picker uses local timezone for FileMaker queries
- Data processing converts datetime strings to UTC
- This causes records from previous days (in local time) to appear in filtered results when they cross timezone boundaries

## 📋 Requirements

### Critical Fixes
1. **Standardize timezone handling** across all date operations
2. **Ensure consistent date filtering** that respects user's local timezone
3. **Fix data field mapping** inconsistencies between expected and actual field names

### Technical Specifications
- All date comparisons should use the same timezone context
- Date range filtering should be inclusive of start/end dates in local timezone
- Maintain backward compatibility with existing FileMaker data structure

## 🛠 Implementation Tasks

### Phase 1: Create Timezone Utility Service
- [ ] Create `src/services/timezoneService.js`
- [ ] Implement consistent date parsing functions
- [ ] Add timezone-aware date comparison utilities
- [ ] Include date formatting functions for FileMaker queries

### Phase 2: Update Date Range Processing
- [ ] Modify `DateRangePicker.jsx` to use timezone service
- [ ] Ensure date range queries account for timezone boundaries
- [ ] Update FileMaker query formation to handle timezone correctly

### Phase 3: Fix Data Processing
- [ ] Update `TimecardWidget.jsx` date extraction functions
- [ ] Ensure all date operations use consistent timezone context
- [ ] Fix field name mapping inconsistencies

## 🔧 Files to Modify
- `src/components/DateRangePicker.jsx`
- `src/components/TimecardWidget.jsx`
- `src/index.jsx`
- Create: `src/services/timezoneService.js`

## ✅ Acceptance Criteria
- [ ] Date range filter from July 14-31 shows only records from those dates in local timezone
- [ ] No records from July 13th appear in July 14-31 filter
- [ ] All date operations are consistent across components
- [ ] Timezone boundaries are properly handled
- [ ] Field name mapping works correctly with actual data structure

## 🧪 Testing Requirements
- [ ] Test with records that cross timezone boundaries
- [ ] Verify date filtering accuracy in different timezones
- [ ] Test with sample data and real FileMaker data
- [ ] Validate week start calculations are timezone-aware

## 📦 Dependencies
- None (internal refactoring)

## 🎯 Assigned To
**Coder** - Implementation of timezone utilities and component updates

## 📅 Priority
**HIGH** - Critical bug affecting data accuracy

## 📝 Notes
- User is in America/Edmonton timezone (UTC-6)
- Current issue: July 13th 6:30 PM local becomes July 14th 12:30 AM UTC
- Need to maintain FileMaker compatibility while fixing timezone handling