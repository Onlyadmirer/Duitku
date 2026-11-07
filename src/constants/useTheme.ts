import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';

export function useTheme() {
  const scheme = useColorScheme() ?? 'dark';
  const isDark = scheme === 'dark';
  const theme = Colors[scheme];

  return { theme, isDark, scheme };
}