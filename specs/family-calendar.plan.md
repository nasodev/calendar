# Family Calendar Application Test Plan

## Application Overview

Comprehensive test plan for a Next.js 16 family calendar application with FastAPI backend. The application features Firebase Authentication with name-to-email mapping, multiple calendar views (month, week, day), event management with recurring event support using RRULE patterns, and category management with color coding. The application runs on http://localhost:23002 with backend API on http://localhost:28000.

## Test Scenarios

### 1. Authentication

**Seed:** `tests/seed.spec.ts`

#### 1.1. Login with valid credentials

**File:** `tests/authentication/login-valid.spec.ts`

**Steps:**
  1. Navigate to http://localhost:23002
  2. Verify redirect to /login page
  3. Enter '환규' in the 이름 (name) field
  4. Enter 'hwankyu' in the 비밀번호 (password) field
  5. Click the 로그인 (Login) button

**Expected Results:**
  - Application redirects to /login when not authenticated
  - Login form displays with name and password fields
  - Name field accepts Korean characters
  - Password field masks input
  - Successful login redirects to main calendar page (/) showing month view
  - User session is established and maintained

#### 1.2. Login with invalid credentials

**File:** `tests/authentication/login-invalid.spec.ts`

**Steps:**
  1. Navigate to http://localhost:23002/login
  2. Enter 'wronguser' in the name field
  3. Enter 'wrongpassword' in the password field
  4. Click the login button

**Expected Results:**
  - Error message is displayed
  - User remains on login page
  - No redirect occurs
  - Form fields remain populated for retry

#### 1.3. Password visibility toggle

**File:** `tests/authentication/password-visibility.spec.ts`

**Steps:**
  1. Navigate to http://localhost:23002/login
  2. Enter a password in the password field
  3. Verify password is masked by default
  4. Click the eye icon button next to password field
  5. Verify password becomes visible
  6. Click the eye icon button again

**Expected Results:**
  - Password field displays as type='password' by default
  - Password characters are masked with dots/asterisks
  - Toggle button shows eye icon when password is hidden
  - Clicking toggle reveals password text
  - Toggle button changes icon when password is visible
  - Clicking toggle again masks the password

#### 1.4. Auto-registration on first login

**File:** `tests/authentication/auto-registration.spec.ts`

**Steps:**
  1. Ensure a new user account exists in Firebase but not in calendar backend
  2. Navigate to http://localhost:23002/login
  3. Login with the new user credentials
  4. Verify successful login and redirect to calendar

**Expected Results:**
  - Backend automatically creates calendar member on first login
  - User can access calendar features immediately
  - Member profile is created with correct name mapping
  - No manual registration step required

#### 1.5. Protected route access without authentication

**File:** `tests/authentication/protected-routes.spec.ts`

**Steps:**
  1. Clear browser session/cookies
  2. Navigate directly to http://localhost:23002/
  3. Verify redirect to login page

**Expected Results:**
  - Unauthenticated users cannot access main calendar page
  - Automatic redirect to /login occurs
  - After login, user is redirected back to originally requested page

#### 1.6. Session persistence

**File:** `tests/authentication/session-persistence.spec.ts`

**Steps:**
  1. Login successfully
  2. Refresh the page
  3. Close and reopen the browser (same session)
  4. Navigate to the application

**Expected Results:**
  - User remains logged in after page refresh
  - User remains logged in after browser restart (if session cookies persist)
  - No need to re-enter credentials
  - Calendar data loads immediately

### 2. Calendar Views

**Seed:** `tests/seed.spec.ts`

#### 2.1. Month view display

**File:** `tests/calendar-views/month-view.spec.ts`

**Steps:**
  1. Login and navigate to calendar
  2. Verify month view is the default view
  3. Check that current month and year are displayed in header (e.g., '2026년 1월')
  4. Verify calendar grid shows 7 columns (일, 월, 화, 수, 목, 금, 토)
  5. Verify all days of the month are displayed
  6. Verify days from previous/next month are shown in grid

**Expected Results:**
  - Month view displays by default after login
  - Current month and year are shown in header
  - Korean day names are displayed correctly
  - Calendar shows complete weeks including overflow days
  - Current day is highlighted (e.g., day 3 has a dark circle)
  - Grid layout is responsive and properly aligned

#### 2.2. Week view display

**File:** `tests/calendar-views/week-view.spec.ts`

**Steps:**
  1. Login and navigate to calendar
  2. Click the '주' (Week) button in the view switcher
  3. Verify week view displays with date range in header (e.g., '12월 28일 - 1월 3일')
  4. Check that 7 day columns are shown with day names and dates
  5. Verify hourly time slots from 00:00 to 23:00 are displayed
  6. Check that time grid allows for event display at specific times

**Expected Results:**
  - Week view button becomes active/highlighted
  - Date range for current week is shown in header
  - All 7 days of the week are visible with headers
  - 24 hourly time slots are displayed on the left
  - Grid provides visual structure for time-based events
  - Current time or day is appropriately highlighted

#### 2.3. Day view display

**File:** `tests/calendar-views/day-view.spec.ts`

**Steps:**
  1. Login and navigate to calendar
  2. Click the '일' (Day) button in the view switcher
  3. Verify day view displays single day with full date in header (e.g., '2026년 1월 3일')
  4. Check that day name is shown (e.g., '토요일')
  5. Verify hourly time slots from 00:00 to 23:00 are displayed
  6. Verify single column layout for the day

**Expected Results:**
  - Day view button becomes active/highlighted
  - Single day date is shown in header with Korean format
  - Day of week name is displayed in Korean
  - 24 hourly time slots are shown
  - Layout provides detailed hourly view for single day
  - More vertical space available for event details

#### 2.4. Switch between calendar views

**File:** `tests/calendar-views/view-switching.spec.ts`

**Steps:**
  1. Login and verify month view is active
  2. Click '주' button to switch to week view
  3. Verify week view is displayed and button is highlighted
  4. Click '일' button to switch to day view
  5. Verify day view is displayed and button is highlighted
  6. Click '월' button to return to month view
  7. Verify month view is displayed and button is highlighted

**Expected Results:**
  - View buttons correctly indicate active view
  - Switching views updates the calendar display immediately
  - Header updates to show appropriate date/range for each view
  - No data loss or page reload occurs during view switching
  - Each view maintains the current date context
  - UI transitions are smooth and responsive

#### 2.5. Date navigation in month view

**File:** `tests/calendar-views/month-navigation.spec.ts`

**Steps:**
  1. Login and verify month view is active showing January 2026
  2. Click the left arrow button in the header
  3. Verify calendar shows December 2025
  4. Click the right arrow button twice
  5. Verify calendar shows February 2026
  6. Click the '오늘' (Today) button
  7. Verify calendar returns to current month

**Expected Results:**
  - Left arrow navigates to previous month
  - Right arrow navigates to next month
  - Month/year header updates correctly
  - Grid updates to show correct days for the month
  - Today button returns to current month and highlights current day
  - Navigation is smooth without page reload

#### 2.6. Date navigation in week view

**File:** `tests/calendar-views/week-navigation.spec.ts`

**Steps:**
  1. Login and switch to week view
  2. Note the current week date range
  3. Click the left arrow button
  4. Verify week view shows previous week
  5. Click the right arrow button twice
  6. Verify week view shows next week
  7. Click the 오늘 button
  8. Verify week view returns to current week

**Expected Results:**
  - Left arrow navigates to previous week
  - Right arrow navigates to next week
  - Date range header updates correctly
  - All 7 days update to show new week
  - Today button returns to current week
  - Current day is highlighted in the week

#### 2.7. Date navigation in day view

**File:** `tests/calendar-views/day-navigation.spec.ts`

**Steps:**
  1. Login and switch to day view
  2. Note the current day date
  3. Click the left arrow button
  4. Verify day view shows previous day
  5. Click the right arrow button twice
  6. Verify day view shows next day
  7. Click the 오늘 button
  8. Verify day view returns to current day

**Expected Results:**
  - Left arrow navigates to previous day
  - Right arrow navigates to next day
  - Date header updates correctly with day name
  - Hourly grid remains consistent across days
  - Today button returns to current day
  - Navigation handles month boundaries correctly

#### 2.8. Click on date in month view

**File:** `tests/calendar-views/month-date-click.spec.ts`

**Steps:**
  1. Login and ensure month view is active
  2. Click on a specific date in the calendar grid
  3. Verify the behavior (e.g., opens event creation dialog or switches to day view)

**Expected Results:**
  - Clicking a date triggers appropriate action
  - Date becomes selected or highlighted
  - Expected navigation or dialog opening occurs
  - User can interact with the selected date

### 3. Event Management - Basic Operations

**Seed:** `tests/seed.spec.ts`

#### 3.1. Create simple event

**File:** `tests/event-management/create-simple-event.spec.ts`

**Steps:**
  1. Login and navigate to calendar
  2. Click the '일정 추가' (Add Event) button
  3. Verify event dialog opens with title '일정 추가'
  4. Enter '팀 미팅' in the 제목 (Title) field
  5. Enter '프로젝트 진행 상황 논의' in the 설명 (Description) field
  6. Verify default date is today (2026년 1월 3일)
  7. Verify default time is 09:00 to 10:00
  8. Click the 저장 (Save) button
  9. Verify dialog closes
  10. Verify event appears on the calendar

**Expected Results:**
  - Event dialog opens when add button is clicked
  - All required fields are available and properly labeled
  - Default date is set to current day or selected day
  - Default time range is reasonable (09:00-10:00)
  - Save button is enabled after entering required fields (title)
  - Event is successfully created and saved to backend
  - Dialog closes automatically after save
  - New event is immediately visible on calendar

#### 3.2. Create all-day event

**File:** `tests/event-management/create-all-day-event.spec.ts`

**Steps:**
  1. Open event creation dialog
  2. Enter '생일 파티' as title
  3. Check the '종일' (All-day) checkbox
  4. Verify that time fields (시작 시간, 종료 시간) are hidden or disabled
  5. Select start date as 2026년 1월 15일
  6. Click save button

**Expected Results:**
  - All-day checkbox is available and clickable
  - When checked, time input fields are hidden or disabled
  - Only date fields are shown for all-day events
  - All-day event is created successfully
  - Event displays as all-day on the calendar (spans entire day cell)

#### 3.3. Edit existing event

**File:** `tests/event-management/edit-event.spec.ts`

**Steps:**
  1. Create a test event first
  2. Click on the event in the calendar
  3. Verify event dialog opens in edit mode
  4. Modify the title to '수정된 미팅'
  5. Change the start time to 14:00
  6. Change the end time to 15:30
  7. Click save button

**Expected Results:**
  - Clicking an event opens it in edit mode
  - All fields are populated with existing event data
  - Title, description, dates, times are all editable
  - Changes are saved to backend via PATCH request
  - Updated event reflects changes on calendar immediately
  - Original event is replaced with updated version

#### 3.4. Delete event

**File:** `tests/event-management/delete-event.spec.ts`

**Steps:**
  1. Create a test event
  2. Click on the event to open edit dialog
  3. Look for and click a delete button (if available in dialog)
  4. Confirm deletion if confirmation dialog appears
  5. Verify event is removed from calendar

**Expected Results:**
  - Delete option is available in event edit dialog
  - Confirmation prompt appears before deletion (recommended)
  - Event is deleted via DELETE API request
  - Event disappears from calendar immediately
  - No error occurs during deletion
  - Other events remain unaffected

#### 3.5. Cancel event creation

**File:** `tests/event-management/cancel-event-creation.spec.ts`

**Steps:**
  1. Click 일정 추가 button to open event dialog
  2. Enter some data in title field
  3. Click the '취소' (Cancel) button
  4. Verify dialog closes without saving

**Expected Results:**
  - Cancel button is visible and functional
  - Clicking cancel closes the dialog
  - No event is created or saved
  - Form data is discarded
  - Calendar remains unchanged

#### 3.6. Close event dialog using X button

**File:** `tests/event-management/close-event-dialog.spec.ts`

**Steps:**
  1. Open event creation dialog
  2. Enter some data
  3. Click the 'Close' button (X icon) in top right
  4. Verify dialog closes without saving

**Expected Results:**
  - Close button (X) is visible in dialog header
  - Clicking close button dismisses dialog
  - No data is saved
  - Works same as cancel button

#### 3.7. Form validation - empty title

**File:** `tests/event-management/validation-empty-title.spec.ts`

**Steps:**
  1. Open event creation dialog
  2. Leave title field empty
  3. Try to click save button

**Expected Results:**
  - Save button is disabled when title is empty
  - Title field is marked as required
  - User cannot submit form without title
  - Helpful validation message may be shown

#### 3.8. Date and time selection

**File:** `tests/event-management/date-time-selection.spec.ts`

**Steps:**
  1. Open event creation dialog
  2. Click the start date button ('2026년 1월 3일')
  3. Verify date picker opens
  4. Select a different date
  5. Verify selected date updates in button
  6. Modify start time to '15:30'
  7. Modify end time to '17:00'
  8. Verify time changes are reflected

**Expected Results:**
  - Date picker button opens calendar selector
  - User can navigate and select dates
  - Selected date is displayed in Korean format
  - Time fields accept HH:MM format
  - Start and end times can be independently set
  - End time validation prevents it from being before start time

#### 3.9. Multi-day event

**File:** `tests/event-management/multi-day-event.spec.ts`

**Steps:**
  1. Open event creation dialog
  2. Enter title '워크샵'
  3. Set start date to 2026년 1월 10일
  4. Set end date to 2026년 1월 12일
  5. Save the event

**Expected Results:**
  - Event with different start and end dates is accepted
  - Event spans multiple days on the calendar
  - Event is visible across all days in its range
  - Visual indication shows the event duration

### 4. Event Management - Recurring Events

**Seed:** `tests/seed.spec.ts`

#### 4.1. Create daily recurring event

**File:** `tests/event-management/recurring-daily.spec.ts`

**Steps:**
  1. Open event creation dialog
  2. Enter title '매일 운동'
  3. Set time to 07:00 - 08:00
  4. Click the 반복 (Recurrence) dropdown
  5. Select '매일' (Daily)
  6. Verify no additional options appear for daily recurrence
  7. Save the event
  8. Switch to month view and verify event appears on multiple consecutive days

**Expected Results:**
  - Daily recurrence option is available
  - Daily recurrence creates instances for consecutive days
  - Backend receives recurrence_pattern with frequency: 'DAILY'
  - Event instances appear on all days within the view range
  - Each instance has correct occurrence_date from backend

#### 4.2. Create weekly recurring event with default weekday

**File:** `tests/event-management/recurring-weekly-default.spec.ts`

**Steps:**
  1. Open event creation dialog
  2. Set start date to a Monday (e.g., 2026년 1월 5일)
  3. Enter title '주간 회의'
  4. Select '매주' (Weekly) from recurrence dropdown
  5. Verify weekday selection buttons appear (월, 화, 수, 목, 금, 토, 일)
  6. Do NOT select any specific weekdays
  7. Note the message: '선택하지 않으면 시작일의 요일에만 반복됩니다'
  8. Save the event

**Expected Results:**
  - Weekly recurrence option is available
  - Weekday buttons are displayed when weekly is selected
  - If no weekdays are explicitly selected, event repeats on start day's weekday only
  - Event appears on every Monday in the calendar view
  - Backend receives recurrence_pattern with frequency: 'WEEKLY' and appropriate weekdays array

#### 4.3. Create weekly recurring event with specific weekdays

**File:** `tests/event-management/recurring-weekly-custom.spec.ts`

**Steps:**
  1. Open event creation dialog
  2. Enter title '수영 수업'
  3. Select '매주' (Weekly) from recurrence dropdown
  4. Click on weekday buttons to select Monday (월), Wednesday (수), Friday (금)
  5. Verify selected buttons are highlighted or visually distinct
  6. Save the event
  7. Verify event appears on Mon, Wed, Fri of each week

**Expected Results:**
  - Multiple weekdays can be selected
  - Selected weekdays are visually indicated (highlighted/active state)
  - Event creates instances on all selected weekdays
  - Backend receives weekdays array: ['MO', 'WE', 'FR']
  - Calendar shows event on correct days of the week

#### 4.4. Create monthly recurring event

**File:** `tests/event-management/recurring-monthly.spec.ts`

**Steps:**
  1. Open event creation dialog
  2. Enter title '월례 보고'
  3. Set start date to 2026년 1월 15일
  4. Select '매월' (Monthly) from recurrence dropdown
  5. Save the event
  6. Navigate through multiple months to verify event appears on 15th of each month

**Expected Results:**
  - Monthly recurrence option is available
  - Event repeats on the same day of each month (15th)
  - Backend receives recurrence_pattern with frequency: 'MONTHLY'
  - Event instances appear on the 15th across multiple months
  - Handles months with different number of days appropriately

#### 4.5. Create yearly recurring event

**File:** `tests/event-management/recurring-yearly.spec.ts`

**Steps:**
  1. Open event creation dialog
  2. Enter title '기념일'
  3. Set start date to 2026년 3월 20일
  4. Select '매년' (Yearly) from recurrence dropdown
  5. Save the event
  6. Navigate to future years and verify event appears on March 20th each year

**Expected Results:**
  - Yearly recurrence option is available
  - Event repeats on the same date each year
  - Backend receives recurrence_pattern with frequency: 'YEARLY'
  - Event instances span multiple years
  - Handles leap years correctly if applicable

#### 4.6. Set recurrence end date

**File:** `tests/event-management/recurring-end-date.spec.ts`

**Steps:**
  1. Open event creation dialog
  2. Create a daily recurring event
  3. Click the '반복 종료일' (Recurrence End Date) button
  4. Verify date picker opens
  5. Select an end date (e.g., 2026년 1월 31일)
  6. Save the event
  7. Verify event only appears up to the specified end date

**Expected Results:**
  - Recurrence end date field is available for recurring events
  - End date is optional (labeled '선택사항')
  - Date picker allows selecting future end date
  - Event instances stop after the specified end date
  - Backend respects the recurrence end date parameter

#### 4.7. Edit recurring event

**File:** `tests/event-management/edit-recurring-event.spec.ts`

**Steps:**
  1. Create a weekly recurring event
  2. Click on one instance of the recurring event
  3. Verify edit dialog opens
  4. Make changes to the event (e.g., change time or title)
  5. Save changes

**Expected Results:**
  - Option to edit single instance or all instances is presented (if implemented)
  - Changes are applied appropriately (to single instance or series)
  - Calendar reflects the changes correctly
  - Other instances remain unaffected if editing single instance
  - All instances update if editing the series

#### 4.8. Delete recurring event

**File:** `tests/event-management/delete-recurring-event.spec.ts`

**Steps:**
  1. Create a daily recurring event
  2. Click on one instance
  3. Click delete option
  4. Verify options for deleting single instance or entire series

**Expected Results:**
  - Option to delete single instance or all instances is available
  - Deleting single instance removes only that occurrence
  - Deleting series removes all instances
  - Confirmation is requested before deletion
  - Calendar updates correctly after deletion

#### 4.9. Weekly recurrence interval

**File:** `tests/event-management/recurring-interval.spec.ts`

**Steps:**
  1. Open event creation dialog
  2. Select weekly recurrence
  3. Look for interval option (e.g., repeat every N weeks)
  4. If available, set interval to 2 (every 2 weeks)
  5. Save and verify event appears bi-weekly

**Expected Results:**
  - Interval field is available for recurrence patterns (if implemented)
  - Interval controls how often the pattern repeats
  - Backend receives interval parameter in recurrence_pattern
  - Event instances respect the interval setting

### 5. Category Management

**Seed:** `tests/seed.spec.ts`

#### 5.1. Open category management dialog

**File:** `tests/category-management/open-dialog.spec.ts`

**Steps:**
  1. Login and navigate to calendar
  2. Click the settings/category icon button in header (gear icon)
  3. Verify category management dialog opens
  4. Verify dialog title is '카테고리 관리'

**Expected Results:**
  - Category management button is visible in calendar header
  - Clicking button opens category dialog
  - Dialog displays current categories or empty state message
  - Initial state shows '등록된 카테고리가 없습니다' if no categories exist

#### 5.2. Create new category

**File:** `tests/category-management/create-category.spec.ts`

**Steps:**
  1. Open category management dialog
  2. Click '카테고리 추가' (Add Category) button
  3. Verify category form appears with name field and color options
  4. Enter '학교' in the category name field
  5. Click on a color button to select a color (e.g., blue)
  6. Verify color button shows selected state
  7. Click '추가' (Add) button
  8. Verify new category appears in the list

**Expected Results:**
  - Add category button is visible and functional
  - Category creation form has name input with placeholder example
  - 16 color options are available for selection
  - Name field is required (Add button disabled when empty)
  - Selected color is visually indicated
  - Category is created and saved to backend
  - New category appears immediately in the list
  - Form resets or hides after successful creation

#### 5.3. Create multiple categories

**File:** `tests/category-management/create-multiple-categories.spec.ts`

**Steps:**
  1. Open category management dialog
  2. Create category '운동' with red color
  3. Create category '가족' with green color
  4. Create category '업무' with blue color
  5. Verify all three categories are listed in the dialog

**Expected Results:**
  - Multiple categories can be created
  - Each category maintains its unique name and color
  - Categories are listed in creation order or alphabetically
  - Color indicators are visible in the category list
  - No duplicate category names are allowed (if validation exists)

#### 5.4. Assign category to event

**File:** `tests/category-management/assign-to-event.spec.ts`

**Steps:**
  1. Create at least one category (e.g., '운동' with red color)
  2. Open event creation dialog
  3. Click the 카테고리 (Category) dropdown
  4. Verify dropdown shows '없음' (None) and all created categories
  5. Select '운동' category
  6. Complete event details and save
  7. Verify event displays with category color on calendar

**Expected Results:**
  - Category dropdown in event dialog shows all available categories
  - Default selection is '없음' (None)
  - User can select a category from the list
  - Selected category is saved with the event
  - Event displays with category color coding on calendar
  - Color helps visually distinguish different event types

#### 5.5. Change event category

**File:** `tests/category-management/change-event-category.spec.ts`

**Steps:**
  1. Create event with '운동' category
  2. Edit the event
  3. Change category to '가족' or '없음'
  4. Save changes
  5. Verify event color updates on calendar

**Expected Results:**
  - Event category can be changed during edit
  - Category can be removed by selecting '없음'
  - Event color on calendar updates to reflect new category
  - Change is persisted to backend

#### 5.6. View all categories in list

**File:** `tests/category-management/view-category-list.spec.ts`

**Steps:**
  1. Create several categories with different names and colors
  2. Open category management dialog
  3. Verify all categories are displayed in a list
  4. Check that each category shows its name and color indicator

**Expected Results:**
  - Category list displays all created categories
  - Each category entry shows name clearly
  - Color indicator is visible for each category
  - List is scrollable if many categories exist
  - Categories are organized in a readable format

#### 5.7. Cancel category creation

**File:** `tests/category-management/cancel-category-creation.spec.ts`

**Steps:**
  1. Open category management dialog
  2. Click add category button
  3. Enter a name and select a color
  4. Click '취소' (Cancel) button
  5. Verify form closes or resets without creating category

**Expected Results:**
  - Cancel button is available in category form
  - Clicking cancel discards entered data
  - No category is created
  - Dialog remains open or returns to category list view

#### 5.8. Category name validation

**File:** `tests/category-management/category-validation.spec.ts`

**Steps:**
  1. Open category creation form
  2. Leave name field empty
  3. Try to click add button
  4. Verify button is disabled
  5. Enter a very long name (>50 characters)
  6. Verify behavior (truncation, validation, or acceptance)

**Expected Results:**
  - Add button is disabled when name is empty
  - Name field is required
  - Long names are handled appropriately (truncated or limited)
  - Special characters in names are handled correctly
  - Validation messages are clear and helpful

#### 5.9. Delete category

**File:** `tests/category-management/delete-category.spec.ts`

**Steps:**
  1. Create a test category
  2. In category management dialog, look for delete option on category
  3. Click delete button/icon for the category
  4. Confirm deletion if prompted
  5. Verify category is removed from list

**Expected Results:**
  - Delete option is available for each category (if implemented)
  - Confirmation prompt appears before deletion
  - Category is removed from backend
  - Category no longer appears in lists
  - Events with deleted category revert to no category or are handled appropriately

#### 5.10. Edit category

**File:** `tests/category-management/edit-category.spec.ts`

**Steps:**
  1. Create a test category
  2. Look for edit option in category list
  3. Click edit to modify name or color
  4. Make changes and save
  5. Verify category updates are reflected

**Expected Results:**
  - Edit option is available for categories (if implemented)
  - Category name and color can be modified
  - Changes are saved to backend
  - Events using the category show updated color immediately
  - Updated category appears in event category dropdown

#### 5.11. Close category dialog

**File:** `tests/category-management/close-category-dialog.spec.ts`

**Steps:**
  1. Open category management dialog
  2. Click the Close button (X) in dialog header
  3. Verify dialog closes and calendar is visible

**Expected Results:**
  - Close button is visible and functional
  - Dialog closes smoothly
  - Any unsaved form data is discarded
  - Calendar view is restored

### 6. UI and UX

**Seed:** `tests/seed.spec.ts`

#### 6.1. Responsive design - desktop view

**File:** `tests/ui-ux/responsive-desktop.spec.ts`

**Steps:**
  1. Set browser viewport to desktop size (1920x1080)
  2. Login and navigate to calendar
  3. Verify all UI elements are properly sized and positioned
  4. Check that calendar grid is wide and readable
  5. Verify dialogs are centered and appropriately sized

**Expected Results:**
  - Layout is optimized for desktop screen sizes
  - Calendar utilizes available width effectively
  - All buttons and controls are easily clickable
  - Text is readable without zooming
  - No horizontal scrolling required

#### 6.2. Responsive design - tablet view

**File:** `tests/ui-ux/responsive-tablet.spec.ts`

**Steps:**
  1. Set browser viewport to tablet size (768x1024)
  2. Login and verify calendar layout adjusts
  3. Check that touch targets are adequately sized
  4. Verify dialogs adapt to smaller width

**Expected Results:**
  - Layout adapts to tablet dimensions
  - All features remain accessible
  - Touch-friendly button sizes
  - No layout breaking or overlap

#### 6.3. Responsive design - mobile view

**File:** `tests/ui-ux/responsive-mobile.spec.ts`

**Steps:**
  1. Set browser viewport to mobile size (375x667)
  2. Login and verify calendar adapts to mobile layout
  3. Check that calendar grid is scrollable if needed
  4. Verify dialogs take appropriate mobile width
  5. Test touch interactions

**Expected Results:**
  - Layout is mobile-optimized
  - Calendar is usable on small screens
  - Dialogs are full-width or appropriately sized
  - Touch interactions work smoothly
  - Text remains readable without zooming

#### 6.4. Korean localization

**File:** `tests/ui-ux/korean-localization.spec.ts`

**Steps:**
  1. Navigate through the application
  2. Verify all labels, buttons, and messages are in Korean
  3. Check date formatting uses Korean format (년, 월, 일)
  4. Verify day names are in Korean (일, 월, 화, 수, 목, 금, 토)

**Expected Results:**
  - Entire UI is in Korean language
  - Date format follows Korean conventions
  - Day and month names are properly localized
  - No English fallback text appears
  - Korean text is properly rendered without encoding issues

#### 6.5. Accessibility - keyboard navigation

**File:** `tests/ui-ux/keyboard-navigation.spec.ts`

**Steps:**
  1. Navigate to calendar using only keyboard (Tab key)
  2. Verify focus indicators are visible on interactive elements
  3. Use Enter/Space to activate buttons
  4. Navigate through calendar dates using arrow keys (if supported)
  5. Open and close dialogs using keyboard

**Expected Results:**
  - All interactive elements are keyboard accessible
  - Focus indicators are clearly visible
  - Tab order is logical and intuitive
  - Enter/Space keys activate focused elements
  - Escape key closes dialogs
  - Arrow keys provide navigation where appropriate

#### 6.6. Accessibility - screen reader support

**File:** `tests/ui-ux/screen-reader.spec.ts`

**Steps:**
  1. Inspect aria labels on interactive elements
  2. Verify buttons have descriptive aria-label or text
  3. Check that form fields have associated labels
  4. Verify dialogs have proper aria roles and labels

**Expected Results:**
  - All buttons have accessible names
  - Form inputs have associated labels
  - Dialog elements have proper ARIA attributes
  - Screen reader can navigate and understand the interface
  - Important state changes are announced

#### 6.7. Visual feedback on interactions

**File:** `tests/ui-ux/visual-feedback.spec.ts`

**Steps:**
  1. Hover over buttons and verify hover states
  2. Click buttons and verify click feedback
  3. Observe loading states when data is being fetched
  4. Check success/error messages after actions

**Expected Results:**
  - Hover effects provide visual feedback
  - Active/pressed states are visible
  - Loading indicators appear during async operations
  - Success and error messages are displayed appropriately
  - Disabled states are visually distinct

#### 6.8. Error handling and user messages

**File:** `tests/ui-ux/error-handling.spec.ts`

**Steps:**
  1. Trigger a network error (disconnect backend)
  2. Attempt to create an event
  3. Verify error message is displayed to user
  4. Reconnect backend and retry
  5. Verify success message appears

**Expected Results:**
  - Network errors are caught and handled gracefully
  - User-friendly error messages are displayed
  - Error messages are in Korean
  - Success confirmations appear after successful actions
  - User can recover from errors easily

#### 6.9. Calendar theme and styling

**File:** `tests/ui-ux/theme-styling.spec.ts`

**Steps:**
  1. Observe overall color scheme and design
  2. Check consistency of button styles across the app
  3. Verify proper use of Tailwind CSS classes
  4. Check that shadcn/ui components are styled consistently

**Expected Results:**
  - UI follows a consistent design system
  - Color scheme is pleasant and accessible
  - Buttons and controls have unified styling
  - shadcn/ui components integrate seamlessly
  - Overall aesthetic is professional and modern

#### 6.10. Performance - page load time

**File:** `tests/ui-ux/page-load-performance.spec.ts`

**Steps:**
  1. Clear browser cache
  2. Navigate to the application
  3. Measure time to interactive
  4. Verify page loads within acceptable time (<3 seconds)

**Expected Results:**
  - Initial page load is fast
  - Calendar data loads within 1-2 seconds
  - No blocking resources delay interactivity
  - Loading indicators prevent confusion during load

#### 6.11. Performance - calendar rendering with many events

**File:** `tests/ui-ux/performance-many-events.spec.ts`

**Steps:**
  1. Create 50+ events across a month
  2. Navigate to month view
  3. Verify calendar renders without lag
  4. Switch to week and day views
  5. Check responsiveness of UI interactions

**Expected Results:**
  - Calendar handles large number of events efficiently
  - No noticeable lag or freezing
  - View switching remains smooth
  - Event rendering is optimized
  - UI remains responsive with heavy data load

### 7. API Integration

**Seed:** `tests/seed.spec.ts`

#### 7.1. Backend connectivity check

**File:** `tests/api-integration/backend-connectivity.spec.ts`

**Steps:**
  1. Login to the application
  2. Verify successful API calls to backend
  3. Check browser network tab for requests to http://localhost:28000
  4. Verify Bearer token is included in Authorization header

**Expected Results:**
  - Frontend successfully connects to backend API
  - API URL is configured from NEXT_PUBLIC_API_URL env var
  - Firebase token is included in all API requests
  - Backend responds with valid data

#### 7.2. GET /calendar/events endpoint

**File:** `tests/api-integration/get-events.spec.ts`

**Steps:**
  1. Login and navigate to calendar
  2. Open browser DevTools network tab
  3. Change calendar view or navigate to different date range
  4. Observe GET request to /calendar/events with start_date and end_date parameters
  5. Verify response contains { events: [...] } structure

**Expected Results:**
  - API endpoint is called when calendar view changes
  - Request includes start_date and end_date query parameters
  - Response structure matches { events: Array }
  - Events include all required fields (id, title, start, end, etc.)
  - Recurring events include occurrence_date for each instance

#### 7.3. POST /calendar/events endpoint

**File:** `tests/api-integration/post-event.spec.ts`

**Steps:**
  1. Create a new event via UI
  2. Observe POST request to /calendar/events in network tab
  3. Verify request body includes title, description, start, end, category, recurrence_pattern
  4. Verify response returns created event with id
  5. Check that event appears immediately on calendar

**Expected Results:**
  - Event creation triggers POST to /calendar/events
  - Request includes all event data
  - Recurrence pattern is sent in correct RRULE format
  - Backend returns created event with assigned ID
  - Frontend updates calendar with new event

#### 7.4. PATCH /calendar/events/{id} endpoint

**File:** `tests/api-integration/patch-event.spec.ts`

**Steps:**
  1. Edit an existing event
  2. Save changes
  3. Observe PATCH request to /calendar/events/{id}
  4. Verify request body contains updated fields
  5. Verify response returns updated event

**Expected Results:**
  - Event update triggers PATCH request
  - Correct event ID is used in URL path
  - Only modified fields are sent (or all fields)
  - Backend returns updated event data
  - Calendar reflects changes immediately

#### 7.5. DELETE /calendar/events/{id} endpoint

**File:** `tests/api-integration/delete-event.spec.ts`

**Steps:**
  1. Delete an event via UI
  2. Observe DELETE request to /calendar/events/{id}
  3. Verify successful response (200/204)
  4. Check that event is removed from calendar

**Expected Results:**
  - Event deletion triggers DELETE request
  - Correct event ID is used
  - Backend confirms deletion
  - Frontend removes event from display
  - No error occurs

#### 7.6. GET /calendar/categories endpoint

**File:** `tests/api-integration/get-categories.spec.ts`

**Steps:**
  1. Login and open category management
  2. Observe GET request to /calendar/categories
  3. Verify response contains array of categories with id, name, color

**Expected Results:**
  - Categories are fetched from backend
  - Response structure is correct
  - Categories are displayed in UI
  - Empty array is handled gracefully

#### 7.7. POST /calendar/categories endpoint

**File:** `tests/api-integration/post-category.spec.ts`

**Steps:**
  1. Create a new category
  2. Observe POST request to /calendar/categories
  3. Verify request includes name and color
  4. Verify response returns created category with id

**Expected Results:**
  - Category creation triggers POST request
  - Request body includes required fields
  - Backend returns created category
  - New category appears in UI immediately

#### 7.8. GET /calendar/auth/verify endpoint

**File:** `tests/api-integration/auth-verify.spec.ts`

**Steps:**
  1. Login to application
  2. Observe GET request to /calendar/auth/verify
  3. Verify Bearer token is sent in Authorization header
  4. Verify response contains member profile data

**Expected Results:**
  - Auth verification endpoint is called after login
  - Firebase token is correctly included
  - Backend verifies token and returns member data
  - Auto-registration creates member if not exists
  - Member profile is used in application

#### 7.9. API error handling - 401 Unauthorized

**File:** `tests/api-integration/error-401.spec.ts`

**Steps:**
  1. Simulate expired or invalid token
  2. Attempt to make API request
  3. Verify 401 response is handled
  4. Check if user is redirected to login

**Expected Results:**
  - 401 errors are caught by frontend
  - User is logged out and redirected to login page
  - Appropriate error message is shown
  - Session is cleared

#### 7.10. API error handling - 500 Server Error

**File:** `tests/api-integration/error-500.spec.ts`

**Steps:**
  1. Simulate backend error (stop backend temporarily)
  2. Attempt to create or fetch events
  3. Verify error is handled gracefully
  4. Check that user sees appropriate error message

**Expected Results:**
  - Network errors are caught
  - User-friendly error message is displayed
  - Application doesn't crash or freeze
  - User can retry the action
  - Partial data is preserved if possible

#### 7.11. API Bearer token injection

**File:** `tests/api-integration/bearer-token.spec.ts`

**Steps:**
  1. Login successfully
  2. Make any API call
  3. Inspect network request headers
  4. Verify Authorization header contains 'Bearer {token}'

**Expected Results:**
  - All API requests include Authorization header
  - Header format is 'Bearer {firebase_token}'
  - Token is obtained from Firebase Auth
  - fetchWithAuth() function correctly injects token

### 8. Edge Cases and Negative Tests

**Seed:** `tests/seed.spec.ts`

#### 8.1. Event time validation - end before start

**File:** `tests/edge-cases/time-validation.spec.ts`

**Steps:**
  1. Open event creation dialog
  2. Set start time to 14:00
  3. Set end time to 13:00 (before start time)
  4. Attempt to save

**Expected Results:**
  - Validation error is shown
  - Save button is disabled or shows error
  - User is informed that end time must be after start time
  - Form cannot be submitted with invalid times

#### 8.2. Create event with very long title

**File:** `tests/edge-cases/long-title.spec.ts`

**Steps:**
  1. Open event creation dialog
  2. Enter a title with 200+ characters
  3. Save the event

**Expected Results:**
  - Long title is handled appropriately (truncated or limited)
  - UI doesn't break with long text
  - Event displays correctly on calendar
  - Title is readable and not overflowing

#### 8.3. Create event with special characters

**File:** `tests/edge-cases/special-characters.spec.ts`

**Steps:**
  1. Create event with title containing special characters: '!@#$%^&*()_+-=[]{}|;:,.<>?'
  2. Save and verify event is created
  3. Edit the event and verify special characters are preserved

**Expected Results:**
  - Special characters are accepted and stored correctly
  - No encoding issues occur
  - Characters display correctly in UI
  - Editing preserves special characters

#### 8.4. Create event with emoji

**File:** `tests/edge-cases/emoji-in-title.spec.ts`

**Steps:**
  1. Create event with emoji in title: '생일 파티 🎉🎂'
  2. Save the event
  3. Verify emoji displays correctly on calendar

**Expected Results:**
  - Emoji characters are supported
  - Emoji renders correctly in all views
  - No character encoding issues
  - Emoji is preserved when editing

#### 8.5. Create many recurring instances

**File:** `tests/edge-cases/many-recurrences.spec.ts`

**Steps:**
  1. Create daily recurring event with no end date
  2. Navigate far into the future (e.g., 2027)
  3. Verify events are generated appropriately
  4. Check performance and responsiveness

**Expected Results:**
  - Backend handles large number of recurring instances
  - Frontend paginates or limits displayed instances
  - Performance remains acceptable
  - No infinite loops or crashes occur

#### 8.6. Browser back button navigation

**File:** `tests/edge-cases/browser-back-button.spec.ts`

**Steps:**
  1. Navigate to calendar, open a dialog
  2. Click browser back button
  3. Verify appropriate behavior (dialog closes or navigation occurs)

**Expected Results:**
  - Back button behavior is defined and consistent
  - User doesn't lose unsaved data unexpectedly
  - Navigation history makes sense
  - No broken states occur

#### 8.7. Page refresh during event creation

**File:** `tests/edge-cases/refresh-during-creation.spec.ts`

**Steps:**
  1. Open event creation dialog
  2. Fill in event details but don't save
  3. Refresh the page
  4. Verify unsaved data is lost (expected behavior)

**Expected Results:**
  - Page refresh resets unsaved changes
  - User returns to calendar view
  - No partial or corrupted data is saved
  - Application state is consistent

#### 8.8. Multiple browser tabs

**File:** `tests/edge-cases/multiple-tabs.spec.ts`

**Steps:**
  1. Open calendar in two browser tabs
  2. Create event in tab 1
  3. Switch to tab 2 and refresh
  4. Verify new event appears in tab 2

**Expected Results:**
  - Changes in one tab are visible in other tabs after refresh
  - No data conflicts occur
  - Each tab maintains independent state until refresh
  - Concurrent edits are handled (last write wins or conflict resolution)

#### 8.9. Leap year handling

**File:** `tests/edge-cases/leap-year.spec.ts`

**Steps:**
  1. Create event on February 29, 2024 (leap year)
  2. Create yearly recurring event
  3. Navigate to 2025 (non-leap year)
  4. Verify how recurrence is handled

**Expected Results:**
  - Leap year dates are accepted
  - Yearly recurrence on Feb 29 is handled appropriately (skips or moves to Feb 28/Mar 1 in non-leap years)
  - No errors occur with leap year logic

#### 8.10. Midnight crossing events

**File:** `tests/edge-cases/midnight-crossing.spec.ts`

**Steps:**
  1. Create event starting at 23:00 and ending at 01:00 next day
  2. Verify event is created
  3. Check how event is displayed across two days

**Expected Results:**
  - Events spanning midnight are supported
  - Event appears on both days appropriately
  - Time display is correct and not confusing
  - Duration calculation is accurate

#### 8.11. Same start and end time

**File:** `tests/edge-cases/same-start-end.spec.ts`

**Steps:**
  1. Create event with start time 10:00 and end time 10:00
  2. Attempt to save

**Expected Results:**
  - Zero-duration events are either prevented or handled gracefully
  - If allowed, event displays as a point in time
  - Validation message may inform user of zero duration

#### 8.12. Empty description field

**File:** `tests/edge-cases/empty-description.spec.ts`

**Steps:**
  1. Create event with title but leave description empty
  2. Save the event
  3. Verify event is created successfully

**Expected Results:**
  - Description is optional
  - Empty description doesn't cause errors
  - Event displays correctly without description

#### 8.13. Rapid clicking on save button

**File:** `tests/edge-cases/rapid-save-clicks.spec.ts`

**Steps:**
  1. Fill out event form
  2. Rapidly click save button multiple times
  3. Verify only one event is created

**Expected Results:**
  - Save button is disabled after first click
  - Duplicate events are not created
  - Backend handles duplicate requests gracefully (idempotency)
  - User feedback indicates processing state
