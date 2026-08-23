# Notes4BtechCSE (N4BC)

## About Me

Hello, I am Srijeet Chatterjee, a second year B.Tech student in Computer Science and Engineering at Techno Main Salt Lake, Kolkata.

I built **Notes4BtechCSE (N4BC)** as a student-focused ecosystem for organizing study materials, university information, notes, practical resources, and academic references for students under MAKAUT.

The goal is simple: make academic resources easier to find, easier to understand, and easier to access.

---

## About Notes4BtechCSE (N4BC)

**Notes4BtechCSE (N4BC)** is a collection of interconnected academic websites designed around different subjects and study requirements.

Instead of placing every subject into one large application, each subject has its own focused study portal. The portals share a common authentication and session system, allowing students to move between them without repeatedly signing in.

The ecosystem currently includes dedicated portals for programming, chemistry, chemistry laboratory work, and mathematics.

---

## Study Portal Ecosystem

| Subject | Code | Portal URL | Description |
| :--- | :--- | :--- | :--- |
| **Basic C & Programming** | ESCS 201 | [cnotesbycsrijeet.vercel.app](https://cnotesbycsrijeet.vercel.app/) | Programming fundamentals, arrays, memory concepts, dynamic memory allocation, and problem sets. |
| **Chemistry I** | BSCH 201 | [chem-notes-nhm8.vercel.app](https://chem-notes-nhm8.vercel.app/) | Theory-focused chemistry portal containing lecture notes and study modules for Engineering Chemistry. |
| **Chemistry Laboratory** | BSCH 291 | [pracchem.vercel.app](https://pracchem.vercel.app/) | Practical experiment manuals, titration tables, lab observations, and viva questions. |
| **Mathematics II** | BSM 201 | [mathsnotesbysrijeet.vercel.app](https://mathsnotesbysrijeet.vercel.app/) | Differential equations, linear algebra, matrix calculus, and step-by-step solved tutorials. |

---

## Why I Built This

Students often spend more time searching for the right material than studying it.

University syllabi, classroom notes, PDFs, practical records, previous questions, and external resources are often scattered across different platforms.

**Notes4BtechCSE (N4BC)** brings these resources into a structured environment built specifically around the academic requirements of MAKAUT students.

The project is also an opportunity to experiment with modern web development, authentication architecture, database design, responsive interfaces, and cross-application communication.

---

## Core Features

### Unified Authentication & Single Active Session
The different study portals use a shared authentication system with single active session protection via Supabase Realtime. A student signs in once and can seamlessly move between connected portals.

### Cross-Domain Session Handling
The ecosystem uses a controlled token handoff mechanism between the individual websites. Authentication state is validated before a session is established on another portal without leaking credentials.

### Session Synchronization
Important study history, preferences, and session states are synchronized across the connected portals.

### Subject-Focused Interfaces
Each website focuses on a specific academic area rather than attempting to place every subject into one cluttered interface.

### Responsive Design
Clean dark frosted glass aesthetic crafted for desktop, tablet, and mobile screens.

---

## Technology Stack

### Frontend
* **Framework:** Next.js 15 / 16 (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS (Vanilla CSS design system tokens)
* **Animations:** Framer Motion
* **Icons:** Lucide React

### Backend & Infrastructure
* **Authentication:** Supabase Auth (SSO / OAuth / Token Handoff)
* **Database:** PostgreSQL (Supabase with RLS & Realtime)
* **Email & Notifications:** Resend SMTP & REST API
* **Deployment:** Vercel Edge & GitHub Pages

---

## Architecture

Notes4BtechCSE (N4BC) follows a multi-portal architecture:

```text
                 Notes4BtechCSE (N4BC - Central Hub)
                                 |
                    Shared Authentication Layer
                                 |
         +-----------------------+-----------------------+
         |                       |                       |
    Programming             Chemistry               Mathematics
      Portal                  Portal                  Portal
   (ESCS 201)              (BSCH 201)               (BSM 201)
         |
    Laboratory Portal
   (BSCH 291 Practical)
```

Each portal remains independently deployable while participating in the larger ecosystem.

---

## Design Philosophy

1. **Less Searching:** Students should spend less time looking for material and more time studying it.
2. **Clear Organization:** Subjects, topics, notes, and resources should have predictable navigation and structure.
3. **Practical Technology:** Built as a real application with production-grade authentication, databases, deployment, and security.

---

## Academic Focus

The project is primarily designed around the needs of students studying under **Maulana Abul Kalam Azad University of Technology (MAKAUT)**, West Bengal.

The initial focus is B.Tech Computer Science and Engineering coursework, structured so that additional subjects and academic resources can be added over time.

---

## Current Status

**Notes4BtechCSE (N4BC)** is an actively developed student project. Current work focuses on expanding academic resources, refining cross-portal synchronization, and enhancing student study utilities.

### Future Plans
* More MAKAUT subjects
* Previous year question (PYQ) resources
* Interactive quizzes and flashcards
* Improved practical & viva resources
* Additional academic utilities

---

## Developer & Connect

**Srijeet Chatterjee**  
*B.Tech in Computer Science and Engineering*  
*Techno Main Salt Lake, Kolkata*  

* **GitHub:** [@srijeetcoder](https://github.com/srijeetcoder)
* **LinkedIn:** [csrijeet-coding](https://www.linkedin.com/in/csrijeet-coding)
* **Instagram:** [@_.srijeet_](https://www.instagram.com/_.srijeet_/)

---

## Built For Students

**Notes4BtechCSE (N4BC)** is made for students who want their academic resources organized in one connected ecosystem.

*Study. Practice. Build. Repeat.*
