import { Slot} from 'expo-router';

// Prevent the splash screen from auto-hiding before asset loading is complete.
export default function RootLayout() {
  
  return (
     <Slot/>
  );
}
