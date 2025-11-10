# Terra Vita Swapper

## Overview
Terra Vita Swapper is a modern web application designed to facilitate seamless asset swapping in a user-friendly environment. The project features a sleek liquid glass aesthetic, supporting both light and dark modes, and includes a blur toggle system for an immersive experience.

## Features
- **Liquid Glass Aesthetic**: The interface employs a frosted glass effect, enhancing visual appeal and user engagement.
- **Light and Dark Modes**: Users can easily switch between light and dark themes to suit their preferences.
- **Blur Toggle**: A dedicated toggle allows users to enable or disable the blur effect, providing customization options for the interface.
- **Responsive Design**: The application is designed to be fully responsive, ensuring a polished appearance across various devices.

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm (Node Package Manager)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/terra-vita-swapper.git
   ```
2. Navigate to the project directory:
   ```bash
   cd terra-vita-swapper
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```

### Running the Application
To start the development server, run:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000` to view the application.

## Project Structure
- **src/**: Contains the source code for the application.
  - **components/**: Reusable components such as Navbar, Hero, Features, and more.
  - **context/**: Context API for managing theme state.
  - **hooks/**: Custom hooks for theme detection.
  - **styles/**: CSS files for global, light, dark, and glass styles.
- **public/**: Static assets and the web app manifest.
- **package.json**: Project metadata and dependencies.
- **tsconfig.json**: TypeScript configuration.
- **vite.config.ts**: Vite configuration for the build process.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.