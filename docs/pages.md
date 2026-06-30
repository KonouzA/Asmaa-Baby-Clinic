# Application Pages Flow & Components

## Navigation Flow

```
Login Page → Home Page → Settings Page
                      → Patients Page → Patient Details Page → New Visit (Examination)
                                      → New Patient Modal
                      → Visits Page → Visit Detail View
                      → Reports Page
```

---

## 1. Login Page

Entry point of the application. Navigates to the Home Page upon successful authentication.

### Components
- **Username / Email Field**
- **Password Field**
- **Login Button**
- **Error State** — inline message on invalid credentials

---

## 2. Home Page

Central hub after login. Links out to all main sections of the app.

### Components
- **Navigation Link Buttons** — Links to:
  - Patients
  - Visits
  - Settings
  - Reports
- **Dashboard Graphs** *(still not specified)*
- **Tasks List** *(like a focus / to-do app)*
- **User / Session Area** — logout button, current user display

---

## 3. Settings Page

Accessible from the Home Page.

### Components
- **Font Size** selector / setting
- **Theme Toggle** — light / dark mode
- **Language / Locale** selector
- **Clinic Profile** — clinic name, doctor name, contact info, logo (used on invoices and printouts)
- **Data & Backup** — export data or trigger a local backup

---

## 4. Patients Page

Accessible from the Home Page. Navigates to Patient Details Page or opens New Patient Modal.

### Components
- **Search Bar** — search by name, ID, or phone number
- **Filters** — filter by age range, gender, date of last visit
- **Paginated List of Patients**
- **New Patient Button** — Opens the New Patient Modal

### Child Views

#### 4a. Patient Details Page

Displays full details of a selected patient.

##### Components
- **Action Bar**:
  - Edit button — enters edit mode for patient fields
  - New Visit button — opens the Visits page pre-loaded with this patient
  - Archive / Delete button
- **Collapsible Sections** with the following tabs/sections:
  - Basic
  - Birth Info
  - Persistent Clinical List
  - Vaccination
  - Growth
- **Visit History** — chronological list of past visits for this patient, each entry links to its Visit Detail View

#### 4b. New Patient Modal

A stepped modal for creating a new patient record.

##### Components
- **Stepped Modal — 5 Steps:**
  1. Basic
  2. Birth Info
  3. Persistent Clinical List
  4. Vaccination
  5. Growth

---

## 5. Visits Page

Accessible from the Home Page (and from Patient Details via "New Visit").

### Components
- **Patient Selector** — select an existing patient or create a new one inline
- **Visit History List** — browsable list of past visits across all patients, with date, patient name, and status; each entry opens its Visit Detail View
- **New Visit Button** — starts a fresh visit for the selected patient
- **Tabbed Visit Interface** with the following tabs:
  - Vitals
  - Physical Examination
  - Screening / Notes
  - Medications
  - Attachments
  - Vaccination
  - NPI (Diagnosis / Prescription)
  - Summary & Payment
- **Save / Draft State** — auto-save or explicit save to persist an in-progress visit
- **Print / Export** — print or export the visit record, prescription, or receipt

### Summary & Payment Tab Detail
- Itemized fee list
- Payment method selector (cash, card, insurance, etc.)
- Total amount
- Receipt / Invoice output (printable)

### Visit Detail View

Read-only (or edit-mode) view of a completed or saved visit record, accessible from Visit History or Patient Details visit history.

---

## 6. Reports Page

Accessible from the Home Page.

### Components
- **Monthly Costs** overview
- **Expense Tracker**
- **Income vs. Expense Chart** — visual comparison of revenue and costs over time
- **Visit Statistics** — total visits per period, broken down by type or status
- **Patient Statistics** — total patients, new patients this month, breakdown by age group or gender
