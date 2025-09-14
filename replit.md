# Family Tree Application

## Overview

A full-stack family tree application that allows users to create, manage, and visualize family relationships. Built with React frontend and Express.js backend using MongoDB for data persistence. Users can register accounts, create multiple family trees, add family members with detailed information, and collaborate with others on shared trees.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for type safety and modern development
- **Vite** as the build tool for fast development and optimized production builds
- **Tailwind CSS** for utility-first styling and responsive design
- **Context API** for global state management, specifically authentication state
- **Component-based architecture** with reusable UI components organized by feature

### Backend Architecture
- **Express.js** server with ES6 modules for modern JavaScript syntax
- **RESTful API design** with dedicated route handlers for authentication, trees, and members
- **JWT-based authentication** with middleware for protected routes
- **Mongoose ODM** for MongoDB interaction with schema validation
- **bcryptjs** for password hashing and secure authentication

### Data Storage
- **MongoDB** as the primary database for flexible document storage
- **Three main collections**:
  - Users: Authentication and profile information
  - FamilyTrees: Tree metadata, ownership, and collaboration settings
  - FamilyMembers: Individual family member data with relationships

### Authentication System
- **JWT tokens** for stateless authentication with 7-day expiration
- **Protected routes** using middleware to verify token validity
- **Role-based permissions** for tree collaboration (read, write, admin)
- **Password hashing** using bcrypt with salt rounds for security

### Development Setup
- **Concurrent development** using concurrently to run both frontend and backend
- **Hot reload** with Vite for frontend and nodemon for backend changes
- **TypeScript configuration** with strict mode and modern ES target
- **ESLint** configuration for React hooks and TypeScript best practices

## External Dependencies

### Frontend Libraries
- **React & React DOM**: Core UI library and rendering
- **Lucide React**: Icon library for consistent UI icons
- **Tailwind CSS**: Utility-first CSS framework with PostCSS and Autoprefixer

### Backend Services
- **MongoDB**: Document database for storing user data, family trees, and member information
- **JWT**: JSON Web Tokens for secure authentication
- **bcryptjs**: Password hashing library for user security
- **CORS**: Cross-origin resource sharing for frontend-backend communication

### Development Tools
- **Vite**: Frontend build tool and development server
- **TypeScript**: Type checking and improved developer experience
- **ESLint**: Code linting for consistent code quality
- **Nodemon**: Backend development server with auto-restart
- **Concurrently**: Tool to run multiple development processes simultaneously

### API Structure
- **Authentication endpoints**: `/api/auth/login`, `/api/auth/register`
- **Tree management**: `/api/trees` for CRUD operations on family trees
- **Member management**: `/api/members` for family member data and relationships
- **Proxy configuration**: Frontend development server proxies API calls to backend on port 3001