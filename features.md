# ABC Pediatric Clinic — System Specification (New Build)

> The design spec for the new pediatric clinic record system. It captures the data model, capabilities, decision-support engines, user flow, and the reference data/standards required to build it — stack-independent. (It supersedes the legacy "ABC" app, which was effectively a sick-visit + billing ledger; the gaps that app had are resolved here by design.)

**Conventions used throughout**
- **Metric units**: weight **kg**, length/height & head circumference **cm**, temperature **°C**.
- **Age is always computed** from date of birth (never typed) and the current/visit date. For preterm infants, **corrected age** is used until ~2 years.
- Growth standards: **CDC (0-36 months and 2-20 years for both female and male, weight-for-age graphs and head circumferance graphs)**. Bilirubin: **AAP threshold curves**.


---

## 1. What the system is

A pediatric clinic desktop application medical record for **a single doctor running their own clinic** (no other staff, no roles), used to:

1. Register children, with their basic information.
2. Optionally add to a queue list of patients visits for the day, then check each **visit** when finished.
3. Record clinical **visits** — vitals (with age-based flags), structured physicial examinations (different categories such as hearing, gastrointestinal, respiratory), medications, vaccination, screening, HPI, diagnoses (ICD-10)+plan+weight-based prescriptions.
4. Plot **growth charts** and a neonatal **bilirubin chart** as decision support.
5. Maintain a per-patient **results history** and generate documents.
6. Produce **clinical and financial reports**.

Access is protected by a single login.

---

Phase 1 of this project:


## 2. Authentication (single user)

This is a **single-user system** — one doctor, one account, full access. There are **no roles or permissions** to manage. Hardcoding the username and password and having one simple check should be sufficient.


---

## 3. Data model

A Patient is a child with one Birth record, persistent clinical lists, an immunization registry, a growth/development history, and many Visits. 

### 3.1 Patient — basic info
| Field | Type | Notes |
|---|---|---|
| MRN | text | Stable medical record number. |
| Full name | text | — |
| **Date of birth** | date | **Required.** Source of all computed age. |
| **Time of birth** | time | With DOB gives **age in hours** — required for the neonatal bilirubin chart (§5.2). |
| Sex | enum | Male / Female (biological — drives growth & BP percentiles). |
| Gestational age at birth | number (weeks) | Drives corrected-age logic and bilirubin curve selection. |
| Blood type | enum | A/B/AB/O ± Rh. |


### 3.2 Birth / perinatal history *(one per patient)*
| Field | Type | Notes |
|---|---|---|
| Birth weight | number (kg) | — |
| Birth length | number (cm) | — |
| Birth head circumference | number (cm) | — |
| Delivery type | enum | NSVD / CS / assisted *(a one-time fact, not per visit)*. |
| NICU admission | yes/no + days | — | preterm
| Neonatal complications | text/coded | Jaundice, RDS, sepsis, etc. |
| Newborn screening | yes/no + result | Metabolic/heel-prick, hearing, CCHD pulse-ox. |
| Feeding | enum | Breast / formula / mixed; weaning status & age. |

### 3.3 Persistent clinical lists *(carried across all visits, shown as a header banner)*
- **Allergy list**: allergen, type (drug/food/environment), reaction, severity (mild/moderate/anaphylaxis), status. → Surfaces as a banner and **blocks/flags conflicting prescriptions** (§5.3).
- **Problem list**: condition, ICD-10, onset date, status (active/chronic/resolved).
- **Medication list**: drug, dose, route, frequency, start/stop (current long-term meds).

### 3.4 Immunization registry
| Field | Type | Notes |
|---|---|---|
| Vaccine | enum | From the configurable schedule (§6.2). |
| Dose number | number | 1st/2nd/3rd/booster. |
| Date given | date | — |


### 3.5 Growth & development records
- **Growth measurement** (one per visit; values in §3.7): CDC (0-36 months and 2-20 years for both female and male, weight-for-age graphs and head circumferance-for-age graphs) **computed percentile + z-score** 
- **Developmental record**: domain (gross motor, fine motor, language, social), milestone status (on track / delayed), screening tool + score (M-CHAT, ASQ, Denver), action.

### 3.6 Visit
| Field | Type | Notes |
|---|---|---|
| Patient | ref → Patient | — |
| Date/time, duration | datetime | — |
| Type | enum | Well-child / sick / follow-up / vaccination / emergency. |
| Status | enum | Booked / checked-in / in-progress / done / no-show / cancelled. |
| Reason / notes | text | — |

### 3.7 Visit — vitals & measurements
| Field | Type | Notes |
|---|---|---|
| Patient / Appointment | refs | — |
| Visit date/time | datetime | Defaults to now. |
| Visit type | enum | Well-child / sick / follow-up / vaccination / emergency. |
| **Age at visit** | computed | From DOB; shown in days/weeks/months/years; shows **corrected age** if preterm and <2y. |
| Weight | number (kg) | — |
| Length / Height | number (cm) | **Length** (recumbent) <2y, **Height** (standing) ≥2y — record which. |
| Head circumference | number (cm) | Tracked to ~2–3y. |
| BMI | computed | From weight + height. |
| Temperature | number (°C) + route | Route: axillary / oral / **rectal** (gold standard in infants) / tympanic. Fever ≈ ≥38.0 °C. |
| Heart rate | number (bpm) | Auto-flag vs age range (§6.3). |
| Respiratory rate | number (/min) | Auto-flag vs age range. |
| Blood pressure | systolic / diastolic (mmHg) | + age/height/sex **percentile**, cuff size & position; not routine <3y. |
| SpO2 | number (%) | Room air vs on O2. Normal ≥95% room air. |
| Growth percentiles/z-scores | computed | All measures, with trend vs prior visits (§5.1). |

### 3.8 Visit / Encounter — clinical content
| Field | Type | Notes |
|---|---|---|
| HPI | structured text | Onset, duration, fever pattern, feeding, urine output, associated symptoms. |
| Physical exam findings | list | One per body category (§6.1): category, description, Normal / Change. |
| **Diagnosis / Assessment** | list (ICD-10) | Coded primary + secondary diagnoses (writes to the problem list). |
| **Plan / management** | structured | Treatment, return-precautions, follow-up date, referrals. |
| **Medications** | list | Structured, weight-based — see §3.9 + §5.3. |
| Vaccines given this visit | → §3.4 | — |
| Screenings (well-child) | structured | Vision, hearing, dental, nutrition/feeding, development. |
| Attachments | files | → Documents (§3.12). |
| Payment (fee) | number | Feeds finance (§3.13). |


### 3.9 Document / attachment
Per-patient file repository (lab PDFs, imaging, referral letters, generated documents). Fields: type/category, title, date, file, linked visit.

### 3.10 Finance — monthly report *(persisted)*
| Field | Type | Notes |
|---|---|---|
| Month / Year | period | — |
| Cost inputs (10) | number each | Electricity (clinic), Electricity (stairs), Water, Personal phone, Landline, Internet, Cleaning, Secretary salary, Medical waste, Others. |
| Total payment | number | Σ of visit fees in the period. |
| Total cost | number | Σ of the 10 cost inputs. |
| Total profit | number | Total payment − total cost. |
| Visit count | number | Encounters in the period (note: visits, not unique patients). |
| Patient count | number | Σ of the number of unique patients. |

---

**Relationships:** Patient table has this information (basic info, persistent clinical list, vaccination, growth) · Patient 1—N Visits (Visit, vitals, physical examination (notes on specific categories such as General Appearance · HEENT · Neck · Chest and Lungs · Cardiovascular · Abdomen · Genitourinary · Rectal · Musculoskeletal · Lymph Nodes · Extremities/Skin · Neurological.), medications, vaccination, screening, HPI, diagnosis/prescription/plan, summary + payment) · Report table on its own  

---

## 6. User flow

### Step 1 — Login
Single-doctor authentication. Hardcoded credentials; no roles.

---

### Step 2 — Homepage / Dashboard

- **Patient task list info card** — today's queue: pending/in-progress/done visits at a glance.
- **Analytics info cards** — patients over time, income trend, and other summary charts.
- **Doaa & Azkar widget** — small corner widget showing a random supplication/dhikr.
- **Navigation cards** — Patients · Visits · Reports (tap any card to enter that section).

---


### Step 3 — Patients page

**List view**
- Paginated patient list with search (name / MRN) and filter (age, sex, etc.).
- "Add Patient" button opens the **New Patient modal** (6 stepped tabs):
  1. Basic Info (name, DOB, time of birth, sex, MRN, blood type, gestational age)
  2. Birth / Perinatal history
  3. Persistent clinical lists (allergies, problem list, current medications)
  4. Immunization registry
  5. Growth & development baseline
  6. Review & Save

**Patient details page** (opened from list row)
Sections always visible:
- Basic birth info
- Persistent clinical data (allergies · problem list · medications)
- Vaccination history & schedule status
- Growth chart(s) (weight-for-age, head circumference-for-age — CDC standards)

---

### Step 4 — Visits page

**List view** — existing visits (searchable/filterable) + "New Visit" button.

**Visit encounter** — tabbed, in order:

| Tab | Content |
|---|---|
| Vitals | Weight, length/height, head circumference, temp, HR, RR, BP, SpO2; auto age-based flags; computed BMI, percentiles, z-scores |
| Physical Examination | 12 category findings (General Appearance · HEENT · Neck · Chest & Lungs · Cardiovascular · Abdomen · Genitourinary · Rectal · Musculoskeletal · Lymph Nodes · Extremities/Skin · Neurological) |
| Medications | Weight-based prescription builder; allergy conflict flags |
| Attachments | Lab PDFs, imaging, referral letters; linked to visit |
| Vaccination | Vaccines given this visit; due/overdue indicators |
| Screening | Vision, hearing, dental, nutrition/feeding, development tools (M-CHAT, ASQ, Denver, FLACC/FACES) |
| HPI | Structured history: onset, duration, fever pattern, feeding, urine output, associated symptoms |
| Diagnosis / Prescription / Plan | ICD-10 coded diagnoses; management plan; referrals; follow-up date |
| Summary + Payment | Visit summary; consultation fee entry |

---

### Step 5 — Reports page

- **Monthly costs / expense tracker** — enter the 10 fixed cost categories; auto-computes total cost, total payment (from visit fees), and profit for the selected month.
- **Data analytics reports** — clinical insights: vaccine coverage, diagnosis frequency, growth trends, patient volume over time.

---

### Step 6 — Settings page

App configuration: credentials, clinic info, immunization schedule selection, vital-sign threshold overrides, cost category labels, and other preferences.

---

## 7. Reference values & data to source

### 7.1 Physical-exam categories (12)
General Appearance · HEENT · Neck · Chest and Lungs · Cardiovascular · Abdomen · Genitourinary · Rectal · Musculoskeletal · Lymph Nodes · Extremities/Skin · Neurological.

### 7.3 Normal vital ranges by age (auto-flagging; awake, approximate)
| Age | Heart rate (bpm) | Respiratory rate (/min) | Systolic BP (mmHg, approx) |
|---|---|---|---|
| Newborn (0–1 mo) | 100–205 | 30–60 | 60–90 |
| Infant (1–12 mo) | 100–180 | 25–50 | 70–100 |
| Toddler (1–3 y) | 90–150 | 20–30 | 80–110 |
| Preschool (3–6 y) | 80–140 | 20–25 | 80–110 |
| School (6–12 y) | 70–120 | 16–22 | 85–120 |
| Adolescent (≥12 y) | 60–100 | 12–20 | 95–130 |
> Fever ≈ ≥38.0 °C (route-dependent; rectal gold standard in infants). **Fever in an infant <3 months → urgent.** SpO2 normal ≥95% room air. All thresholds configurable.
