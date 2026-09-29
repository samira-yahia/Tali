import { Badge, Button, Card, createTheme, SegmentedControl, type MantineColorsTuple } from '@mantine/core';

const lime: MantineColorsTuple = ['#f9ffe0', '#f1ffc2', '#e4ff8a', '#d7fa52', '#cef52a', '#c8f000', '#b4d800', '#8ca800', '#647800', '#3c4800'];
const violet: MantineColorsTuple = ['#f3e8fd', '#e3cbfb', '#c898f6', '#ad63f1', '#9637ec', '#7a1fe0', '#6a18c4', '#56139f', '#420e7a', '#2e0955'];
const yellow: MantineColorsTuple = ['#fff9e1', '#fff0c8', '#fde497', '#fbd661', '#f9cb37', '#f5c542', '#e0ad1c', '#c29512', '#a68009', '#8a6a00'];
// dark[6] = cards, dark[7] = page background, dark[8] = header / rail
const dark: MantineColorsTuple = ['#F2F2F2', '#D0D0D0', '#A6A6A6', '#7A7A7A', '#383838', '#2E2E2E', '#2B2B2B', '#0E0E0E', '#161616', '#080808'];

export const theme = createTheme({
  primaryColor: 'lime',
  primaryShade: 5,
  autoContrast: true,
  colors: { lime, violet, yellow, dark },
  fontFamily: "'Poppins', system-ui, sans-serif",
  headings: { fontFamily: "'Poppins', system-ui, sans-serif", fontWeight: '600' },
  defaultRadius: 'md',
  radius: { sm: '8px', md: '14px', lg: '18px', xl: '26px' },
  components: {
    Card: Card.extend({ defaultProps: { radius: 'xl', padding: 'lg', bg: 'dark.6' } }),
    Button: Button.extend({ defaultProps: { radius: 'xl' } }),
    Badge: Badge.extend({ defaultProps: { radius: 'xl', variant: 'filled', size: 'md' }, styles: { root: { textTransform: 'none' } } }),
    SegmentedControl: SegmentedControl.extend({ defaultProps: { radius: 'xl', color: 'lime' } }),
  },
});
