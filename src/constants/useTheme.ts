import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors'; // sesuaikan path file Colors Anda

export function useTheme() {
  const scheme = useColorScheme(); // menghasilkan 'light' atau 'dark'
  const isDark = scheme === 'dark';
  const theme = Colors[scheme ?? 'light'];

  return { theme, isDark, scheme };
}