# .NET Web App Starter

A complete full-stack starter template for building modern web applications with .NET Core Web API backend and TypeScript frontend.

## 🚀 Features

- **Backend**: .NET Core 8 Web API with Entity Framework Core
- **Database**: MySQL with proper schema and relationships
- **Frontend**: TypeScript + Webpack + Bootstrap
- **Development**: Hot reload for both frontend and backend
- **Architecture**: Clean separation of concerns, scalable project structure

## 📋 Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MySQL Server](https://dev.mysql.com/downloads/mysql/)
- [Git](https://git-scm.com/)

## 🛠️ Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/dotnet-webapp-starter.git
cd dotnet-webapp-starter
```

### 2. Backend Setup
```bash
cd Backend/MessageBoard.API

# Install EF Core tools (one-time setup)
dotnet tool install --global dotnet-ef

# Update connection string in appsettings.json with your MySQL credentials

# Create and run database migrations
dotnet ef migrations add InitialCreate
dotnet ef database update

# Start the API
dotnet run
```
API will be available at: `https://localhost:7xxx`

### 3. Frontend Setup
```bash
cd Frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
Frontend will be available at: `http://localhost:3000`

## 📁 Project Structure

```
dotnet-webapp-starter/
├── Backend/
│   └── MessageBoard.API/              # .NET Core Web API
│       ├── Controllers/
│       ├── Models/                    # Entity models (User, Thread, Message)
│       ├── Data/                      # DbContext and database configuration
│       └── Program.cs                 # Application entry point with CORS
├── Frontend/
│   ├── src/
│   │   ├── ts/                        # TypeScript source files
│   │   ├── scss/                      # Sass stylesheets
│   │   └── index.html                 # Main HTML template
│   ├── webpack.config.js              # Build configuration
│   └── package.json                   # Node.js dependencies
└── README.md
```

## 🔧 Configuration

### Database Connection
Update `Backend/MessageBoard.API/appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=MessageBoardDB;User=root;Password=yourpassword;Port=3306;"
  }
}
```

### CORS Policy
The API is configured to allow requests from `http://localhost:3000` in development. Update `Program.cs` for production domains.

## 📚 Complete Setup Guide

For detailed setup instructions, troubleshooting, and architectural explanations, see the [Complete Setup Guide](https://claude.ai/public/artifacts/f21c64ab-6c37-4329-8024-7dbbb2113242).

This guide includes:
- Step-by-step setup instructions
- Entity Framework configuration
- Webpack and TypeScript configuration
- Mental shifts from React to vanilla TypeScript
- Common troubleshooting solutions

## 🧪 Testing the Setup

1. **Backend Test**: Visit `https://localhost:7xxx/weatherforecast`
2. **Frontend Test**: Check browser console for "TypeScript + Webpack working!" message
3. **CORS Test**: Open browser DevTools on frontend and run:
   ```javascript
   fetch('https://localhost:7xxx/weatherforecast')
     .then(response => response.json())
     .then(data => console.log(data));
   ```

## 🚀 Available Scripts

### Backend
```bash
dotnet run              # Start development server
dotnet build            # Build the project
dotnet ef migrations add <name>  # Create new migration
dotnet ef database update       # Apply migrations
```

### Frontend
```bash
npm run dev             # Start development server with hot reload
npm run build           # Build for production
npm start               # Start development server and open browser
```

## 🏗️ What's Included

### Backend Models
- **User**: Basic user entity with username and email
- **Thread**: Discussion threads with titles and creation timestamps
- **Message**: Individual messages within threads

### Database Features
- Proper Entity Framework relationships
- Foreign key constraints
- Unique indexes on username/email
- Cascade delete policies

### Frontend Tools
- TypeScript for type safety
- Webpack for bundling and development server
- Bootstrap for responsive styling
- Hot reload for fast development

## 🔄 Next Steps

This starter provides the foundation for building:
- Message boards / Forums
- Blog platforms
- Social media applications
- Any CRUD-based web application

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Troubleshooting

**Common Issues:**
- **EF Migration Errors**: Ensure MySQL server is running and connection string is correct
- **CORS Errors**: Check that frontend URL matches the CORS policy in `Program.cs`
- **Port Conflicts**: Modify ports in `webpack.config.js` or `launchSettings.json` if needed
- **Package Conflicts**: Run `dotnet clean` and `npm ci` to reset dependencies

For more detailed troubleshooting, see the [Complete Setup Guide](https://claude.ai/public/artifacts/f21c64ab-6c37-4329-8024-7dbbb2113242).

---

⭐ **If this starter helped you, please give it a star!** ⭐