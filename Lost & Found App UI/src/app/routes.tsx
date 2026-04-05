import { createBrowserRouter } from 'react-router';
import { SplashScreen } from './screens/SplashScreen';
import { LoginScreen } from './screens/LoginScreen';
import { SignupScreen } from './screens/SignupScreen';
import { HomeFeedScreen } from './screens/HomeFeedScreen';
import { ChatbotScreen } from './screens/ChatbotScreen';
import { AddPostScreen } from './screens/AddPostScreen';
import { ConversationsScreen } from './screens/ConversationsScreen';
import { DirectMessageScreen } from './screens/DirectMessageScreen';
import { ProfileScreen } from './screens/ProfileScreen';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: SplashScreen,
  },
  {
    path: '/login',
    Component: LoginScreen,
  },
  {
    path: '/signup',
    Component: SignupScreen,
  },
  {
    path: '/feed',
    Component: HomeFeedScreen,
  },
  {
    path: '/chatbot',
    Component: ChatbotScreen,
  },
  {
    path: '/add',
    Component: AddPostScreen,
  },
  {
    path: '/conversations',
    Component: ConversationsScreen,
  },
  {
    path: '/dm/:id',
    Component: DirectMessageScreen,
  },
  {
    path: '/profile',
    Component: ProfileScreen,
  },
]);