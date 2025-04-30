# Financial Management Web Application

A comprehensive web application for managing personal finances, including income and expense tracking with customizable financial planning allocations.

## Features

- **User Authentication**: Secure login and registration using Firebase Authentication
- **Financial Dashboard**: Overview of income, expenses, and current balance
- **Transaction Management**: Record and categorize income and expenses
- **Financial Planning**: Customize allocation percentages (e.g., 70-20-10, 60-20-20) for needs, wants, and savings
- **Transaction History**: Track and filter all financial transactions
- **Responsive Design**: Works on both desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore
- **State Management**: React Context API

## Prerequisites

Before you begin, ensure you have:

- Node.js (v18 or higher)
- npm or yarn
- A Firebase account

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd financial-management-app
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Firebase Setup

1. Create a new Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Set up Firebase Authentication and enable Email/Password provider
3. Create a Firestore database
4. Get your Firebase project configuration

### 4. Environment Configuration

Create a `.env.local` file in the root of your project with the following Firebase configuration:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Replace the placeholder values with your actual Firebase project details.

### 5. Run the development server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Application Structure

- **`src/app`**: Next.js app directory with all pages and routing
  - **`dashboard`**: Main dashboard view
  - **`financial-plan`**: Financial allocation settings
  - **`transactions`**: Transaction listing and management
  - **`login`** & **`signup`**: Authentication pages
- **`src/contexts`**: React Context providers
- **`src/firebase`**: Firebase configuration and initialization
- **`src/services`**: Business logic and Firebase interactions
- **`src/types`**: TypeScript interfaces and type definitions

## Usage Guide

1. **Register/Login**: Create a new account or log in with existing credentials
2. **Dashboard**: View your financial overview
3. **Add Transactions**: Record new income or expenses
4. **Financial Plan**: Set up your preferred allocation model
   - Choose from presets like 70-20-10, 60-20-20, or customize your own
5. **View Transactions**: Filter and view all your financial activity

## Deployment

The application can be deployed to Vercel with the following command:

```bash
vercel
```

For production deployment:

```bash
vercel --prod
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
