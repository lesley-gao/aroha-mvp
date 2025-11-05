---
title: Aroha MVP - Phase 2 Enhancements: Diary Preview, Speech-to-Text, and History Visualization
version: 1.0
date_created: 2025-11-06
last_updated: 2025-11-06
owner: Lesley Gao
tags: [design, enhancement, diary, speech-recognition, data-visualization, phq-9]
---

# Introduction

This specification defines three enhancement features for the Aroha MVP application to improve user engagement and data insights:
1. **Diary Entry Preview** - Detailed view mode for saved diary entries
2. **Speech-to-Text Recording** - Voice input capability for diary entries (English-only MVP)
3. **PHQ-9 History Visualization** - Chart-based visualization of assessment trends over time

These enhancements build upon the existing diary and PHQ-9 assessment features to provide a more comprehensive mental health tracking experience.

## 1. Purpose & Scope

**Purpose**
- Enhance the diary feature with read-only preview and voice input capabilities
- Provide visual insights into PHQ-9 score trends to help users track their mental health journey
- Improve accessibility and user engagement through multiple input methods

**Scope**
- Diary preview page with navigation between entries
- Web Speech API integration for English voice recording
- Interactive charts showing PHQ-9 score trends using Recharts
- Responsive design for mobile and desktop
- Bilingual UI support (English and Te Reo Māori)

**Out of Scope for MVP**
- Te Reo Māori speech recognition (future enhancement)
- Advanced analytics and correlations between diary and PHQ-9 data
- Audio recording/export of diary entries

**Audience**
- Product owner, frontend developers, UX designer, testers

**Assumptions**
- Users have modern browsers with Web Speech API support (Chrome, Edge, Safari)
- Existing Supabase integration is working for diary and PHQ-9 data
- Users understand that voice recording requires microphone permissions

## 2. Definitions

- **Speech-to-Text (STT)**: Technology that converts spoken words into written text using the Web Speech API
- **Web Speech API**: Browser-based API for speech recognition, no external service required
- **Recharts**: React charting library built on D3.js for data visualization
- **RLS (Row Level Security)**: Supabase security feature ensuring users only access their own data
- **Diary Entry Preview**: Read-only view of a previously saved diary entry
- **PHQ-9 Score Trend**: Visual representation of depression screening scores over time

## 3. Requirements, Constraints & Guidelines

### Diary Entry Preview

- **REQ-101**: The app SHALL provide a dedicated preview route `/diary/view/:date` for viewing saved diary entries
- **REQ-102**: The preview page SHALL display entry date, title, full content, and metadata (created/updated timestamps)
- **REQ-103**: The preview page SHALL provide navigation to previous/next diary entries chronologically
- **REQ-104**: The preview page SHALL include an "Edit" button that navigates back to the diary edit page with the selected date
- **REQ-105**: The preview page SHALL include a "Delete" button with confirmation dialog
- **REQ-106**: Recent entries sidebar SHALL be clickable, navigating to the preview page for the selected entry
- **REQ-107**: Preview page SHALL be read-only with no inline editing capabilities

### Speech-to-Text

- **REQ-201**: The app SHALL provide a microphone button on the diary content textarea for voice input
- **REQ-202**: The app SHALL use Web Speech API with `lang: 'en-NZ'` (New Zealand English) for speech recognition
- **REQ-203**: The app SHALL show a visual indicator (recording pulse animation) when actively recording
- **REQ-204**: The app SHALL transcribe speech in real-time and append to the textarea content
- **REQ-205**: The app SHALL provide start/stop controls for voice recording
- **REQ-206**: The app SHALL handle browser permission requests gracefully with clear error messages
- **REQ-207**: The app SHALL show a message indicating "English-only" when recording starts
- **REQ-208**: The app SHALL work with the title field as well (toggle between title and content input)
- **REQ-209**: The app SHALL handle speech recognition errors (no microphone, permission denied, network issues)

### PHQ-9 History Visualization

- **REQ-301**: The History page SHALL display a line chart showing PHQ-9 total scores over time
- **REQ-302**: The chart SHALL use color-coded severity levels: 
  - 0-4 (Minimal): Green
  - 5-9 (Mild): Yellow
  - 10-14 (Moderate): Orange  
  - 15-19 (Moderately Severe): Red
  - 20-27 (Severe): Dark Red
- **REQ-303**: The chart SHALL display data points for each assessment with date labels
- **REQ-304**: The chart SHALL include a reference line for the moderate threshold (score = 10)
- **REQ-305**: The chart SHALL be responsive and work on mobile devices
- **REQ-306**: The History page SHALL show summary cards displaying:
  - Total number of assessments
  - Average score
  - Trend direction (improving/declining)
  - Most recent score and date
- **REQ-307**: The chart SHALL handle empty states gracefully with a "No data yet" message
- **REQ-308**: The chart SHALL show tooltips on hover/tap with score details

### General Constraints

- **SEC-101**: All diary entries and PHQ-9 records SHALL be protected by Supabase RLS policies
- **SEC-102**: Speech recognition SHALL process audio locally in the browser (no external API calls)
- **SEC-103**: No voice audio SHALL be stored or transmitted; only transcribed text is saved
- **CON-101**: Speech recognition is limited to English (en-NZ) for MVP release
- **CON-102**: Speech recognition requires microphone permission; feature degrades gracefully if denied
- **CON-103**: Charts require minimum 2 data points to display meaningful trends
- **GUD-101**: Use consistent UI patterns from existing Aroha design system
- **GUD-102**: Provide clear feedback for all user actions (loading, success, errors)
- **GUD-103**: Ensure all features work offline (except Supabase sync)

### Browser Compatibility

- **PAT-101**: Speech recognition SHALL work in Chrome, Edge, and Safari (latest versions)
- **PAT-102**: Provide fallback message for unsupported browsers (Firefox, older browsers)
- **PAT-103**: Charts SHALL work across all modern browsers including mobile

## 4. Interfaces & Data Contracts

### Diary Entry (Extended Schema)

```typescript
interface DiaryEntry {
  id: string;
  user_id: string;
  entry_date: string; // YYYY-MM-DD format
  title?: string; // Optional title field
  content: string;
  created_at: string; // ISO-8601 timestamp
  updated_at: string; // ISO-8601 timestamp
}
```

### PHQ9Record (Existing Schema)

```typescript
interface PHQ9Record {
  id: string;
  user_id: string;
  answers: number[]; // Array of 9 numbers (0-3 each)
  total: number; // Sum of answers (0-27)
  severity: 'Minimal' | 'Mild' | 'Moderate' | 'Moderately severe' | 'Severe';
  created_at: string; // ISO-8601 timestamp
}
```

### Speech Recognition Event Types

```typescript
interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

interface SpeechRecognitionError {
  error: 'no-speech' | 'audio-capture' | 'not-allowed' | 'network' | 'aborted';
  message: string;
}
```

### Chart Data Point

```typescript
interface ChartDataPoint {
  date: string; // Formatted date (e.g., "Nov 1")
  score: number; // PHQ-9 total score (0-27)
  severity: string; // Severity label
  fullDate: string; // ISO date for tooltip
}
```

## 5. Acceptance Criteria

### Diary Preview

- **AC-101**: Given a saved diary entry, When the user clicks on it in the recent entries sidebar, Then the app navigates to `/diary/view/YYYY-MM-DD` showing the full entry
- **AC-102**: Given the user is viewing a diary entry, When they click "Edit", Then the app navigates to `/diary` with the entry loaded for editing
- **AC-103**: Given the user is viewing a diary entry, When they click "Delete" and confirm, Then the entry is deleted from Supabase and the user returns to the diary list
- **AC-104**: Given the user is on a diary preview page, When they click "Previous" or "Next", Then the app navigates to the chronologically adjacent entry
- **AC-105**: Given there are no previous/next entries, When the user views the preview, Then the corresponding navigation button is disabled

### Speech-to-Text

- **AC-201**: Given the user clicks the microphone button, When browser permissions are granted, Then the app starts recording and shows the recording indicator
- **AC-202**: Given the app is recording speech, When the user speaks, Then the transcribed text appears in real-time in the textarea
- **AC-203**: Given the app is recording, When the user clicks the stop button, Then recording stops and the final transcript is saved to the textarea
- **AC-204**: Given the user denies microphone permission, When they click the microphone button, Then an error message displays explaining permission is required
- **AC-205**: Given the browser doesn't support Web Speech API, When the diary page loads, Then the microphone button is hidden or disabled with an explanatory message
- **AC-206**: Given the user is recording, When they switch between title and content fields, Then the recording continues to the newly selected field

### PHQ-9 Visualization

- **AC-301**: Given the user has completed multiple PHQ-9 assessments, When they navigate to the History page, Then a line chart displays showing score trends over time
- **AC-302**: Given data points on the chart, When the user hovers/taps a point, Then a tooltip shows the exact score, date, and severity level
- **AC-303**: Given the user has no PHQ-9 records, When they view the History page, Then a message displays "No assessments yet. Complete your first PHQ-9 to see trends."
- **AC-304**: Given PHQ-9 scores over time, When the chart is rendered, Then severity color zones are visible (green, yellow, orange, red)
- **AC-305**: Given summary cards on the History page, When data is available, Then cards show: total assessments, average score, trend arrow (↑/↓), and last assessment date
- **AC-306**: Given the user is on mobile, When they view the chart, Then it is responsive and scrollable/zoomable as needed

## 6. Test Automation Strategy

### Test Levels
- **Unit Tests**: Component logic, speech recognition handlers, chart data transformations
- **Integration Tests**: Supabase queries, routing, state management
- **E2E Tests**: Full user flows from diary entry to preview, voice recording, chart interaction

### Testing Framework
- **Unit/Integration**: Jest + React Testing Library
- **E2E**: Playwright or Cypress
- **Coverage Target**: 70% for new features

### Test Cases

**Diary Preview Tests**
```javascript
// Unit tests
- DiaryView component renders with entry data
- Navigation buttons enable/disable correctly
- Delete action calls Supabase delete function

// E2E tests
- User creates entry → clicks in sidebar → views preview
- User edits entry from preview → changes persist
- User deletes entry → entry removed from list
```

**Speech-to-Text Tests**
```javascript
// Unit tests (with mocked Web Speech API)
- SpeechToText component initializes recognition
- Transcript updates append to textarea
- Error handling for permission denial

// E2E tests (manual or with browser automation)
- User clicks mic → permission prompt → recording starts
- User speaks → text appears in textarea
- User stops recording → final text saved
```

**Chart Tests**
```javascript
// Unit tests
- Chart component renders with mock data
- Data transformation creates correct chart points
- Color mapping matches severity levels
- Summary cards calculate averages correctly

// Integration tests
- Chart fetches real PHQ-9 data from Supabase
- Empty state renders when no data available

// E2E tests
- User completes PHQ-9 → score appears in chart
- User hovers over data point → tooltip shows details
```

### Test Data Management
- Use factories for generating test diary entries and PHQ-9 records
- Mock Web Speech API in tests (not available in CI environments)
- Use deterministic dates and scores for chart tests

### CI/CD Integration
- Run unit and integration tests on every PR
- Run E2E tests on staging deployment
- Generate test coverage reports
- Block merge if coverage drops below 70%

## 7. Rationale & Context

### Why Diary Preview?
- Separates writing mode (editing) from reading mode (reflection)
- Allows users to review past thoughts without accidental edits
- Supports journaling best practices (reflection on past entries)
- Provides better UX for navigating between entries chronologically

### Why Speech-to-Text?
- **Accessibility**: Helps users with typing difficulties or disabilities
- **Convenience**: Faster input method for longer entries
- **Engagement**: Lower barrier to entry for daily journaling
- **Mental Health Context**: Speaking thoughts can be therapeutic
- **English-Only MVP**: Web Speech API has excellent English support; Te Reo Māori support can be added later with Azure Cognitive Services

### Why English-Only First?
- Web Speech API has production-ready English support (free, no API costs)
- Allows quick MVP validation without Azure integration costs
- Can gather usage data to justify investment in Māori language support
- Reduces complexity for initial launch

### Why PHQ-9 Visualization?
- **Clinical Relevance**: Trends are more meaningful than individual scores
- **User Engagement**: Visual feedback motivates continued use
- **Therapeutic Value**: Users can see progress or identify patterns
- **Professional Use**: Clinicians can use trends for treatment planning
- **Evidence-Based**: Research shows visualizations improve mental health self-monitoring

### Why Recharts?
- React-specific library with excellent TypeScript support
- Responsive and mobile-friendly out of the box
- Accessible (ARIA labels, keyboard navigation)
- Smaller bundle size than Chart.js
- Composable components fit React paradigm

## 8. Dependencies & External Integrations

### External Systems
- **EXT-101**: Supabase - Database for diary entries and PHQ-9 records (existing)
- **EXT-102**: Web Speech API - Browser-based speech recognition (no external service)

### Third-Party Libraries
- **LIB-101**: Recharts (`npm install recharts`) - Chart rendering library
  - Version: Latest stable (2.x)
  - License: MIT
  - Bundle size: ~150KB gzipped
- **LIB-102**: date-fns (already in project) - Date formatting for charts
- **LIB-103**: React Router (already in project) - Routing for diary preview pages

### Browser APIs
- **API-101**: Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`)
  - Required for speech-to-text feature
  - Browser support: Chrome/Edge (full), Safari (partial), Firefox (none)
- **API-102**: MediaDevices API (`navigator.mediaDevices.getUserMedia`)
  - Required for microphone access
  - Requires HTTPS in production

### Infrastructure Dependencies
- **INF-101**: HTTPS hosting (required for microphone access in production)
- **INF-102**: Supabase RLS policies must be configured for diary_entries table

### Data Dependencies
- **DAT-101**: Existing PHQ-9 records in Supabase (for chart rendering)
- **DAT-102**: Diary entries with `title` column (migration required if not exists)

### Compliance Dependencies
- **COM-101**: Must comply with browser security policies for microphone access
- **COM-102**: Must inform users that speech is processed locally (privacy notice)
- **COM-103**: GDPR compliance for data export (diary and PHQ-9 history)

## 9. Examples & Edge Cases

### Diary Preview Example

**URL**: `/diary/view/2025-11-06`

**Display**:
```
┌────────────────────────────────────┐
│ ← Back to Diary                    │
├────────────────────────────────────┤
│ November 6, 2025                   │
│ My Diary Entry Title               │
├────────────────────────────────────┤
│ This is the full content of my     │
│ diary entry. I can read it here    │
│ without accidentally editing it.   │
│                                    │
│ Created: Nov 6, 2025 2:30 PM       │
│ Updated: Nov 6, 2025 2:35 PM       │
├────────────────────────────────────┤
│ [← Previous] [Edit] [Delete] [Next→]│
└────────────────────────────────────┘
```

### Speech-to-Text Example Flow

```
1. User clicks microphone button
   → Permission prompt appears
   
2. User grants permission
   → Red recording indicator pulses
   → "Recording (English)..." message shows
   
3. User speaks: "Today was a good day"
   → Text appears in real-time: "Today was a good day"
   
4. User continues: "I felt happy"
   → Text appends: "Today was a good day I felt happy"
   
5. User clicks stop
   → Recording ends
   → Final text saved in textarea
```

### Chart Example

```typescript
const chartData = [
  { date: 'Oct 15', score: 12, severity: 'Moderate', fullDate: '2025-10-15' },
  { date: 'Oct 22', score: 9, severity: 'Mild', fullDate: '2025-10-22' },
  { date: 'Oct 29', score: 6, severity: 'Mild', fullDate: '2025-10-29' },
  { date: 'Nov 5', score: 4, severity: 'Minimal', fullDate: '2025-11-05' }
];

// Renders as line chart with:
// - Downward trend (improving)
// - Color transitions from orange → yellow → green
// - Moderate threshold line at y=10
```

### Edge Cases

**Diary Preview**
- **Edge-001**: Entry has no title → Display "(Untitled Entry)" placeholder
- **Edge-002**: Entry is the only one → Disable both Previous and Next buttons
- **Edge-003**: Entry is deleted while viewing → Redirect to `/diary` with message
- **Edge-004**: Invalid date in URL → Show 404 or redirect to diary list

**Speech-to-Text**
- **Edge-101**: User denies microphone permission → Show error: "Microphone access required for voice recording"
- **Edge-102**: Browser doesn't support Web Speech API → Hide microphone button, show "(Voice recording not supported in this browser)"
- **Edge-103**: Network error during recognition → Show "Speech recognition error. Please try again."
- **Edge-104**: User speaks in non-English language → Transcription may be inaccurate, no error shown
- **Edge-105**: Background noise interferes → May produce incorrect transcription, user can edit

**Chart Visualization**
- **Edge-201**: Only 1 PHQ-9 record exists → Show single point, no trend line
- **Edge-202**: All scores are identical → Show flat line with message "Consistent scores over time"
- **Edge-203**: 50+ assessments → Chart may be crowded; implement scrolling or data sampling
- **Edge-204**: Score jumps drastically (e.g., 5 → 25) → Highlight with visual indicator and safety prompt

## 10. Validation Criteria

### Functional Validation
- ✅ All acceptance criteria (Section 5) pass manual and automated testing
- ✅ Diary preview navigation works correctly in all directions
- ✅ Speech recognition transcribes English with >80% accuracy in quiet environments
- ✅ Charts render correctly with various data set sizes (1, 2, 10, 50+ records)
- ✅ All features work on mobile and desktop browsers

### Security Validation
- ✅ Supabase RLS policies prevent cross-user data access
- ✅ Speech processing happens entirely client-side (verify in network tab)
- ✅ No sensitive data logged to console or analytics

### Accessibility Validation
- ✅ Charts have ARIA labels for screen reader users
- ✅ Speech recording button has keyboard support
- ✅ Color contrast meets WCAG AA standards
- ✅ Focus indicators visible on all interactive elements

### Performance Validation
- ✅ Chart renders in <1 second for datasets up to 100 records
- ✅ Speech recognition latency <500ms from speech end to text display
- ✅ Diary preview page loads in <500ms

### Browser Compatibility
- ✅ Chrome/Edge: Full feature support including speech recognition
- ✅ Safari: Full feature support with vendor prefix (`webkitSpeechRecognition`)
- ✅ Firefox: Graceful degradation (no speech support, clear message shown)
- ✅ Mobile browsers: Touch interactions work correctly

## 11. Related Specifications / Further Reading

### Internal Documents
- [Aroha MVP Core Specification](./spec-design-aroha-mvp.md) - Main application spec
- [Supabase Auth Setup Guide](../docs/SUPABASE_AUTH_SETUP.md) - Authentication configuration
- [Diary Feature Documentation](../docs/DIARY_FEATURE.md) - Existing diary implementation

### External Resources
- [Web Speech API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) - MDN reference
- [Recharts Documentation](https://recharts.org/en-US/) - Chart library guide
- [PHQ-9 Interpretation Guide](https://www.phqscreeners.com/) - Severity thresholds
- [React Router v6 Guide](https://reactrouter.com/en/main) - Routing patterns

### Research & Evidence
- Kroenke, K., et al. (2001). "The PHQ-9: Validity of a brief depression severity measure"
- Harmon, K. J., et al. (2020). "Effectiveness of self-monitoring for depression: A systematic review"
- Mental Health Foundation of New Zealand - [mentalhealth.org.nz](https://mentalhealth.org.nz/)

---

**End of Specification**

**Implementation Timeline:**
- Phase 1 (Charts): 2-3 hours
- Phase 2 (Speech-to-Text): 3-4 hours  
- Phase 3 (Diary Preview): 2-3 hours
- Total estimated effort: 7-10 hours

**Next Steps:**
1. Review and approve this specification
2. Set up Recharts dependency
3. Implement features in recommended phase order
4. Conduct user testing after each phase
5. Gather feedback and iterate