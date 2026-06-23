# Digital Register

A web-based record management system designed to digitize and organize administrative records efficiently. The platform provides a centralized database for managing citizen information, public records, complaints, welfare schemes, and other essential data through an intuitive interface.

---

## Features

- Citizen Record Management
- Complaint Registration and Tracking
- Welfare Scheme Management
- Employee Record Management
- Public Asset Tracking
- Secure Database Storage
- Search and Filter Records
- Add, Update, Delete Operations (CRUD)
- User-Friendly Dashboard
- Centralized Data Management

---

## Tech Stack

### Frontend
- HTML5
- CSS3
- JavaScript

### Backend
- Node.js
- Express.js

### Database
- MySQL

### Additional Packages
- Express
- MySQL2
- Body Parser
- Nodemon
- Other dependencies listed in `package.json`

---

## Project Structure

```text
Digital-Register/
│
├── node_modules/
│
├── public/
│   ├── css/
│   ├── js/
│   └── images/
│
├── views/
│
├── routes/
│
├── database/
│
├── server.js
├── package.json
├── package-lock.json
├── README.md
│
└── .gitignore
```

---

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/Digital-Register.git
```

### 2. Move into Project Directory

```bash
cd Digital-Register
```

### 3. Install Dependencies

```bash
npm install
```

> Do NOT upload `node_modules` to GitHub. Running `npm install` will automatically recreate it.

### 4. Configure Database

Create a MySQL database and update your database credentials inside the project configuration file.

Example:

```javascript
host: "localhost",
user: "root",
password: "your_password",
database: "digital_register"
```

### 5. Start the Application

```bash
node server.js
```

or

```bash
npm start
```

For development:

```bash
npm run dev
```

---

## Database Modules

### Citizen Management
- Add Citizen
- Update Citizen
- Delete Citizen
- Search Citizen

### Complaint Management
- Register Complaint
- Track Complaint Status
- Resolve Complaints

### Welfare Scheme Management
- Scheme Registration
- Beneficiary Tracking

### Employee Management
- Staff Information
- Role Management

### Asset Management
- Infrastructure Records
- Public Resource Tracking

---

## How It Works

1. User accesses the dashboard.
2. Records are stored in a centralized MySQL database.
3. Users can perform CRUD operations.
4. Data can be searched, filtered, and updated efficiently.
5. Administrators can manage multiple categories of records through a single platform.

---

## Future Enhancements

- Role-Based Authentication
- OTP Verification
- PDF Report Generation
- Data Analytics Dashboard
- Mobile Application
- Cloud Deployment
- AI-Based Record Search
- Automated Notifications

---

## Screenshots

### Dashboard

Add dashboard screenshot here.

```text
screenshots/dashboard.png
```

### Record Management

```text
screenshots/records.png
```

### Complaint Portal

```text
screenshots/complaints.png
```

---

## Contributors

### Ayush Dabral

- Database Design
- Backend Development
- API Development
- CRUD Operations
- Testing and Integration

---

## License

This project is developed for educational and academic purposes.

---

## Getting Started After Cloning

```bash
git clone <repository-url>
cd Digital-Register
npm install
npm start
```

The application will start on:

```text
http://localhost:3000
```

---
