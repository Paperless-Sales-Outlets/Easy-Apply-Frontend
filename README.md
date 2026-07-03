<div align="center">
  <img src="src/assets/sltlogoOnly.png" alt="Paperless Logo" width="120" />
  <h1>[ P A P E R L E S S ]</h1>
  <p><strong>A digital platform for SLTMobitel customer application forms</strong></p>
</div>

---

## ❖ SYSTEM OVERVIEW
SLTMobitel Paperless is a responsive web application designed to digitize and streamline the process of submitting various customer application forms. It provides a user-friendly wizard interface for customers to easily fill out and submit their requests online, reducing the need for physical paperwork.

### Core Capabilities
* **Multi-Language Support**: Fully localized in English, Sinhala, and Tamil to cater to a diverse customer base.
* **Wizard-Based Forms**: Step-by-step guided forms for 9 different service requests:
  * New Connection (FTTH/LTE/COPPER)
  * Re-connection of SLT Service
  * Location Change
  * Termination of Service
  * Ownership Change
  * Package Migration
  * Service Vacation
  * Refund Request
  * Customer Request Acceptance
* **Responsive Design**: Optimized for desktop, tablet, and mobile devices to ensure a seamless user experience.

---

## ❖ ARCHITECTURE & TECH STACK
* **Frontend Framework**: React 19
* **Build Tool**: Vite
* **Routing**: React Router DOM
* **Internationalization**: i18next & react-i18next
* **Styling**: Custom CSS with CSS Variables for theming and responsive layouts
* **Icons**: React Icons (Feather Icons)

---

## ❖ DEPLOYMENT INSTRUCTIONS

### Prerequisites
* Node.js (v18 or higher recommended)
* npm or yarn

### Local Development
1. Navigate to the project directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Production Build
1. Build the application for production:
   ```bash
   npm run build
   ```
2. The optimized production files will be generated in the `dist` directory. These files can be deployed to any static file hosting service (e.g., Nginx, Vercel, Netlify, AWS S3).

---
