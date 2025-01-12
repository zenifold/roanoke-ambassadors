Here’s a detailed and robust prompt for your AI coding agent to create the app for your local Roanoke Ambassador program. This prompt outlines the core functionality, architecture, and design requirements for the app, ensuring it meets your needs for collaboration, event management, and user interaction.

---

### **Prompt for AI Coding Agent: Roanoke Ambassador Program App**

#### **Objective**
Create a robust, elegant, and collaborative web application for the Roanoke Ambassador Program. The app will allow users to log in, create and manage events, collaborate on event details, assign tasks, and finalize event information. The app should have a simple, Apple-inspired design with black and white themes, and use Firebase/Firestore for authentication and database, Next.js for the front end, and Shadcn UI for components.

---

### **Core Functionality**
1. **User Authentication and Authorization**
   - Use Firebase Authentication for secure user sign-in and sign-up.
   - Users can sign up with email/password or Google OAuth.
   - Role-based access control (e.g., Ambassadors, Admins).

2. **Event Management**
   - Users can create, edit, and delete events.
   - Collaborative event details: Ambassadors can add, edit, and assign tasks, budgets, sponsors, volunteers, and other event-related information.
   - Real-time updates using Firestore for seamless collaboration.

3. **Task Management**
   - Tasks can be created, assigned, and tracked within each event.
   - Task statuses (e.g., To Do, In Progress, Completed).
   - Notifications for task assignments and updates.

4. **Event Calendar**
   - A calendar view to visualize upcoming events.
   - Filter events by status (e.g., Draft, Finalized, Completed).
   - Allow users to sign up as volunteers for events directly from the calendar.

5. **Collaboration Tools**
   - Real-time chat or comments within each event for collaboration.
   - Ability to tag users in comments or tasks.

6. **Reporting and Analytics**
   - Generate reports for event budgets, volunteer participation, and sponsor contributions.
   - Visualize data using charts or graphs.

---

### **Architecture**
1. **Front End**
   - Framework: Next.js (React-based).
   - UI Library: Shadcn UI for elegant, Apple-inspired components.
   - Themes: Black and white themes with toggle functionality.
   - Responsive Design: Mobile-first approach for seamless use on all devices.

2. **Back End**
   - Authentication: Firebase Authentication.
   - Database: Firestore for real-time data storage and synchronization.
   - API: Next.js API routes for server-side logic.

3. **Hosting**
   - Deploy the app on Vercel for seamless integration with Next.js.

---

### **Detailed Functional Requirements**

#### **1. Landing Page**
   - Clean, elegant design with a brief description of the Roanoke Ambassador Program.
   - Call-to-action buttons: "Sign In" and "Sign Up."
   - Footer with contact information and links to social media.

#### **2. Sign In & Sign Up Page**
   - Firebase Authentication for secure login.
   - Sign-up form with fields: Name, Email, Password, and Role (Ambassador/Admin).
   - Google OAuth for quick sign-in.
   - Error handling for invalid credentials or duplicate accounts.

#### **3. App Home Page**
   - Dashboard-style layout with:
     - **Recent Events**: List of events the user is involved in.
     - **Assigned Tasks**: Tasks assigned to the user across all events.
     - **Notifications**: Updates on task assignments, event changes, or comments.
   - Quick access to create a new event.

#### **4. Events Page**
   - List of all events with filters for:
     - Status (Draft, Finalized, Completed).
     - Labels (e.g., Fundraising, Community, Networking).
   - Search bar to find specific events.
   - Each event card shows:
     - Event name, date, location, and status.
     - Number of tasks completed vs. total tasks.

#### **5. Event Creation Form**
   - Form fields:
     - Event Name.
     - Event Idea (description).
     - Created By (auto-filled with the logged-in user).
     - Initial details (date, location, time).
   - Save as Draft or Finalize options.

#### **6. Event Details Page**
   - Central hub for all event-related information.
   - Sections:
     - **Overview**: Event name, date, location, time, and description.
     - **Tasks**: List of tasks with assignees, due dates, and statuses.
     - **Budget**: Details of the budget, including requested funds and sponsors.
     - **Volunteers**: List of volunteers needed and those who have signed up.
     - **Sponsors**: List of sponsors and their contributions.
     - **Comments**: Real-time chat for collaboration.
   - Edit functionality for authorized users.

#### **7. Event Calendar**
   - Interactive calendar view (e.g., FullCalendar.js).
   - Events displayed with color-coded statuses (Draft, Finalized, Completed).
   - Click on an event to view details or sign up as a volunteer.
   - Filter events by labels or status.

---

### **Design Requirements**
1. **Themes**
   - Black and white themes with a toggle switch in the user profile.
   - Elegant, minimalist design inspired by Apple’s aesthetic.

2. **Typography**
   - Clean, sans-serif fonts (e.g., SF Pro, Inter).

3. **Icons**
   - Use consistent, modern icons for actions (e.g., edit, delete, assign).

4. **Animations**
   - Subtle animations for transitions (e.g., hover effects, loading states).

---

### **Technical Requirements**
1. **Firebase Integration**
   - Set up Firebase project with Firestore and Authentication.
   - Configure Firestore rules for secure data access.

2. **Next.js API Routes**
   - Create API endpoints for CRUD operations on events, tasks, and users.

3. **Real-Time Updates**
   - Use Firestore listeners for real-time updates on events and tasks.

4. **Error Handling**
   - Display user-friendly error messages for failed actions (e.g., sign-in, event creation).

5. **Testing**
   - Write unit tests for critical components and API routes.
   - Perform end-to-end testing for user flows.

---

### **Deliverables**
1. Fully functional web application deployed on Vercel.
2. Source code with clear documentation.
3. User guide for Ambassadors and Admins.

---

This prompt provides a comprehensive roadmap for your AI coding agent to build the Roanoke Ambassador Program app. Let me know if you need further refinements or additional features!