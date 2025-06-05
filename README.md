# ar-admin-dashboard

This is a Next.js-based admin dashboard application with integrated features for user management, analytics, and reporting. Built with modern libraries and tools, it leverages Supabase for backend services and includes a responsive design using Bootstrap.

## ⚠️ DISCLAIMER

> **Important Notice**: This repository is a **learning project** created for educational purposes to study Supabase and Next.js integration during an institutional project.
>
> **Security Notice**: This public version has been **significantly modified** and many components, features, and sensitive information have been **removed or sanitized** to protect institutional security and confidentiality.
>
> **Purpose**: This repository serves as a learning reference and demonstration of Supabase + Next.js integration patterns. It is **not intended for production use** and may not represent the complete functionality of the original private version.

> **Note**: This repository was previously private but has been made public for demonstration and educational purposes only.

## Version

- **Version**: 0.1.0

## Features

- User authentication and management using Supabase
- Analytics integration with Vercel Analytics
- PDF generation capabilities with jsPDF
- QR code generation with the `qrcode` library
- Responsive UI with Bootstrap and React Bootstrap
- Unique ID generation with `uuid`
- Device management system
- File storage with Supabase Storage

## Prerequisites

- Node.js (recommended LTS version)
- npm (comes with Node.js)
- Git (for version control)
- Supabase account and project

## Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd admin-dashboard-publicver
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up Supabase configuration:**

   Edit the file `src/app/lib/supabase.js` and replace the placeholder values:

   ```javascript
   import { createClient } from "@supabase/supabase-js";

   const supabaseUrl = "YOUR_SUPABASE_URL_HERE";
   const supabaseKey = "YOUR_SERVICE_ROLE_KEY_HERE";

   export const supabase = createClient(supabaseUrl, supabaseKey);
   ```

   **To get your Supabase credentials:**

   - Go to your [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project
   - Go to Settings → API
   - Copy your Project URL and Service Role key

## Database Setup

Create the following tables in your Supabase database:

### 1. `devices` table

```sql
CREATE TABLE devices (
  id SERIAL PRIMARY KEY,
  brand VARCHAR,
  ip VARCHAR,
  application TEXT,
  url TEXT,
  description TEXT,
  serial VARCHAR,
  api_url VARCHAR,
  rack INT4,
  activity TIMESTAMP,
  category VARCHAR,
  slot INT4
);
```

### 2. `users` table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR,
  name VARCHAR,
  password VARCHAR,
  activity TIMESTAMP,
  role VARCHAR
);
```

## Storage Setup

Create the following storage structure in your Supabase Storage:

1. **Create a new bucket named:** `device-models`
2. **Set bucket to Public**
3. **Create the following folder structure:**
   - `ready-use-object/` (folder for device model files)

**Storage Structure:**

```
device-models/
└── ready-use-object/
    ├── Server-1U-82724cda-b2a0-...
    ├── Server-27db2fc0-1a00-43b...
    └── Server-2U-2e6e5679-07d5...
```

## Usage

- **Development Mode:**

  ```bash
  npm run dev
  ```

  Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

- **Build for Production:**

  ```bash
  npm run build
  ```

- **Start the Production Server:**

  ```bash
  npm run start
  ```

- **Linting:**
  ```bash
  npm run lint
  ```

## Scripts

- `npm run dev`: Starts the development server
- `npm run build`: Builds the application for production
- `npm run start`: Starts the production server
- `npm run lint`: Runs ESLint to check for code quality issues

## Dependencies

- `@supabase/supabase-js`: ^2.49.4 - Supabase client library
- `@vercel/analytics`: ^1.5.0 - Analytics integration
- `bcryptjs`: ^3.0.2 - Password hashing
- `bootstrap`: ^5.3.6 - CSS framework
- `bootstrap-icons`: ^1.11.3 - Icon library
- `jspdf`: ^3.0.1 - PDF generation
- `next`: 15.3.1 - React framework
- `qrcode`: ^1.5.4 - QR code generation
- `react`: ^19.0.0 - UI library
- `react-bootstrap`: ^2.10.9 - Bootstrap components for React
- `react-dom`: ^19.0.0 - React DOM utilities
- `react-icons`: ^5.5.0 - Icon components
- `uuid`: ^11.1.0 - Unique ID generation

## DevDependencies

- `@eslint/eslintrc`: ^3 - ESLint configuration
- `eslint`: ^9 - Code linting
- `eslint-config-next`: 15.3.1 - Next.js ESLint configuration

## Project Structure

```
ar-admin-dashboard/
├── src/
│   └── app/
│       └── lib/
│           └── supabase.js    # Supabase configuration
├── public/                   # Static assets
├── package.json             # Dependencies and scripts
└── README.md               # This file
```

## Database Schema

The application uses two main tables:

**Devices Table:**

- Stores device information including brand, IP, applications, and metadata
- Tracks device activity and categorization
- Includes rack and slot information for physical organization

**Users Table:**

- Manages user authentication and authorization
- Stores user profiles and activity tracking
- Implements role-based access control

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure your code passes linting checks (`npm run lint`)
5. Submit a pull request

Please ensure your code follows the existing style and includes appropriate tests.

## Troubleshooting

### Common Issues:

1. **Supabase Connection Issues:**

   - Verify your Supabase URL and Service Role key are correct
   - Check that your Supabase project is active
   - Ensure your database tables are created with the correct schema

2. **Storage Issues:**

   - Verify the `device-models` bucket exists and is set to Public
   - Check that the folder structure matches the requirements

3. **Build Issues:**
   - Run `npm install` to ensure all dependencies are installed
   - Check for any TypeScript or ESLint errors

## Security Notes

- Never commit your Supabase credentials to version control
- Use environment variables for production deployments
- The Service Role key should only be used server-side
- Implement proper Row Level Security (RLS) policies in Supabase

## Educational Purpose

This project was developed as part of learning Supabase and Next.js integration during an institutional project. The code structure and patterns demonstrated here can be used as reference material for similar educational projects.

**Learning Objectives Covered:**

- Supabase authentication and database integration
- Next.js app router and server components
- React Bootstrap UI development
- File storage management with Supabase Storage
- PDF generation and QR code implementation

## Limitations of This Public Version

Please be aware that this public repository:

- Contains **limited functionality** compared to the original institutional version
- Has **sanitized data structures** and **removed sensitive configurations**
- May have **incomplete features** or **placeholder implementations**
- Is intended for **learning and reference purposes only**
- Should **not be used as-is for production environments**

## Contact

For questions about the learning aspects or technical implementation, contact the project maintainer at **thaaan184@gmail.com**.

## License

This project is available for demonstration and educational purposes only. All institutional and sensitive content has been removed or modified to protect organizational security.
