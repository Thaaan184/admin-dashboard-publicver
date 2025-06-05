# ar-admin-dashboard

This is a Next.js-based admin dashboard application with integrated features for user management, analytics, and reporting. Built with modern libraries and tools, it leverages Supabase for backend services and includes a responsive design using Bootstrap.

## Version

- **Version**: 0.1.0

## Features

- User authentication and management using Supabase.
- Analytics integration with Vercel Analytics.
- PDF generation capabilities with jsPDF.
- QR code generation with the `qrcode` library.
- Responsive UI with Bootstrap and React Bootstrap.
- Unique ID generation with `uuid`.

## Prerequisites

- Node.js (recommended LTS version)
- npm (comes with Node.js)
- Git (for version control)

## Installation

1. Clone the repository:
   git clone <repository-url>
   cd ar-admin-dashboard</repository-url>

2. Install dependencies:
   npm install

3. Set up environment variables (create a `.env.local` file based on `.env.example` if provided, or configure Supabase credentials).

## Usage

- **Development Mode**:
  npm run dev

Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

- **Build for Production**:
  npm run build

- **Start the Production Server**:
  npm run start

- **Linting**:
  npm run lint

## Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the production server.
- `npm run lint`: Runs ESLint to check for code quality issues.

## Dependencies

- `@supabase/supabase-js`: ^2.49.4
- `@vercel/analytics`: ^1.5.0
- `bcryptjs`: ^3.0.2
- `bootstrap`: ^5.3.6
- `bootstrap-icons`: ^1.11.3
- `jspdf`: ^3.0.1
- `next`: 15.3.1
- `qrcode`: ^1.5.4
- `react`: ^19.0.0
- `react-bootstrap`: ^2.10.9
- `react-dom`: ^19.0.0
- `react-icons`: ^5.5.0
- `uuid`: ^11.1.0

## DevDependencies

- `@eslint/eslintrc`: ^3
- `eslint`: ^9
- `eslint-config-next`: 15.3.1

## Contributing

Feel free to submit issues or pull requests. Please ensure your code passes the linting checks before submitting.

## Contact

For questions or support, contact the project maintainer at **thaaan184@gmail.com**.
