# Lost & Found - AI-Powered Mobile App

A modern, bilingual (Arabic RTL / English LTR) mobile app for lost and found items with AI-powered features and dynamic animations.

## ✨ Features

### 🔐 Authentication
- **Login Screen** - Smooth animated login with email/password
- **Signup Screen** - Registration with email verification flow
- **Forgot Password** - Password recovery option
- Dynamic form validation with real-time feedback

### 📱 Core Screens

1. **Splash Screen**
   - Animated logo with rotating rings
   - Smooth fade-in transitions
   - Theme toggle
   - Privacy policy link

2. **Home Feed**
   - Text-only posts with Lost/Found status
   - Keyword highlighting (محفظة, مفاتيح, هاتف, etc.)
   - Location and timestamp info
   - Smooth scroll animations
   - Gradient hover effects

3. **AI Chatbot**
   - Interactive chat interface
   - AI-powered item matching
   - Keyword highlighting in responses
   - Typing indicators
   - Smooth message animations

4. **Add Post**
   - Toggle between Lost/Found items
   - AI auto-enhancement notice
   - Image upload (Lost items only)
   - Location tagging
   - Animated form validation

5. **Conversations**
   - List of active DM threads
   - Unread indicators with pulse animation
   - Avatar with gradient backgrounds
   - Smooth hover effects

6. **Direct Messages**
   - Real-time messaging interface
   - Image sharing capability
   - Message bubbles with timestamps
   - Online status indicator

7. **Profile**
   - User statistics
   - Theme switcher (Light/Dark)
   - Language switcher (Arabic/English)
   - Post history
   - Animated settings panel

### 🎨 Design Features

#### Color Palette
- **Creative Colors**: #b8ed44, #9fbf2a, #415a1a, #3e5916, #263b06, #070706
- **Primary**: Navy Blue #0B1F3A
- **Secondary**: Cream #F5F1E8
- **Accent**: Beige #D9CBB3
- **Soft Blue**: #3A6EA5

#### Animations & Interactions
- ✅ **Pop Effects** - Buttons scale and bounce on press
- ✅ **Fade In/Out** - Smooth screen transitions
- ✅ **Glow Effects** - Pulsing indicators and badges
- ✅ **Shimmer** - Loading and processing states
- ✅ **Hover Effects** - Interactive card highlights
- ✅ **Rotation** - Logo and icon animations
- ✅ **Scale Transforms** - Dynamic button feedback
- ✅ **Gradient Flows** - Smooth color transitions

### 🌐 Bilingual Support
- **Arabic (RTL)** - Primary language with full right-to-left support
- **English (LTR)** - Secondary language with left-to-right layout
- Automatic direction switching
- Complete translation coverage
- Native font support

### 🌙 Theme Support
- **Light Mode** - Cream background with navy text
- **Dark Mode** - Near-black background with lime accents
- Smooth theme transitions
- Consistent color semantics
- Auto-adapted borders and shadows

### 🎯 UX Principles
- Minimal and calm design
- Human-centric interactions
- Privacy-focused (DM-only)
- Fast and responsive
- Trustworthy and modern
- Premium feel throughout

## 🚀 Technical Stack
- React 18.3.1
- React Router 7
- Motion (Framer Motion)
- Tailwind CSS 4
- TypeScript
- Lucide Icons

## 📂 Project Structure
```
/src/app
  /components
    - BottomNav.tsx (Animated navigation)
  /context
    - AppContext.tsx (Global state)
  /screens
    - SplashScreen.tsx
    - LoginScreen.tsx
    - SignupScreen.tsx
    - HomeFeedScreen.tsx
    - ChatbotScreen.tsx
    - AddPostScreen.tsx
    - ConversationsScreen.tsx
    - DirectMessageScreen.tsx
    - ProfileScreen.tsx
  - App.tsx
  - routes.tsx
```

## 🎭 Key Interactions

### Button Press Effects
- Scale down to 0.98 on tap
- Scale up to 1.02 on hover
- Gradient shimmer on hover
- Spring physics for natural feel

### Card Animations
- Fade in on scroll
- Scale on hover
- Shadow depth changes
- Gradient overlays

### Navigation
- Smooth page transitions
- Active tab indicators with layoutId
- Bottom nav slides up on mount
- Icons rotate and scale on interaction

### AI Features
- Description enhancement
- Keyword matching and highlighting
- Smart item suggestions
- Real-time processing indicators

## 📱 Responsive Design
- Mobile-first approach
- Max-width containers (448px)
- Touch-friendly targets
- Smooth scrolling
- Bottom navigation for easy thumb access

## 🔒 Privacy & Security
- DM-only communication
- No public contact info
- Privacy policy displayed
- Secure authentication flow
- Email verification

## 🌟 Special Features
- Custom scrollbar with gradient
- Selection highlighting
- Smooth scroll behavior
- RTL-aware animations
- Theme-aware colors
- Keyword highlighting in content
- Pulse animations for notifications
- Gradient backgrounds and buttons

---

Built with ❤️ for the modern web
