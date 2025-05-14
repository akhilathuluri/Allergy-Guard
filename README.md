# Allergy Guard 🛡️

Allergy Guard is a comprehensive web application designed to help users manage and monitor their food allergies. The application uses advanced technologies including AI and image recognition to scan food products and restaurant menus, providing real-time allergy information and recommendations.

## 🌟 Features

- **User Authentication**
  - Secure signup and login system
  - Protected routes for authenticated users
  - User profile management

- **Allergy Management**
  - Add and manage personal allergies
  - Track allergy history
  - View detailed allergy information

- **Product Scanning**
  - Scan food product labels using camera
  - AI-powered ingredient analysis
  - Real-time allergy warnings
  - Scan history tracking

- **Restaurant Menu Scanner**
  - Scan restaurant menus
  - Identify potential allergens
  - Get safe food recommendations

- **Smart Meal Recommendations**
  - AI-powered meal suggestions
  - Allergy-safe recipe recommendations
  - Personalized dietary guidance

## 🏗️ System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **UI Components**: Custom components with Lucide React icons
- **Notifications**: React Toastify

### Backend
- **Database**: Supabase
- **Authentication**: Supabase Auth
- **AI Integration**: Google Generative AI
- **Image Processing**: Tesseract.js for OCR

### Development Tools
- **Build Tool**: Vite
- **Package Manager**: npm
- **Linting**: ESLint
- **Type Checking**: TypeScript

## 📁 Project Structure

```
allergy-guard/
├── src/
│   ├── components/     # Reusable UI components
│   ├── context/       # React context providers
│   ├── lib/           # Utility functions and configurations
│   ├── pages/         # Page components
│   ├── types/         # TypeScript type definitions
│   ├── App.tsx        # Main application component
│   └── main.tsx       # Application entry point
├── supabase/          # Supabase configuration and migrations
├── public/            # Static assets
└── configuration files
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm (v7 or higher)
- Supabase account
- Google AI API key

### Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd allergy-guard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GOOGLE_AI_API_KEY=your_google_ai_api_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Building for Production
```bash
npm run build
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## 🔒 Security

- All sensitive routes are protected
- API keys are stored in environment variables
- User authentication is handled through Supabase
- Data is encrypted in transit and at rest

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- Athuluri Akhil

## 🙏 Acknowledgments

- Supabase for backend services
- Google AI for intelligent analysis
- Tesseract.js for OCR capabilities
- React and Vite communities for excellent documentation 
