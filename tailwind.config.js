/**
 * TailwindCSS configuration for the Rey Automotriz project.
 *
 * This file extends the default Tailwind theme to include the
 * brand colours and font families defined in the manual de marca.
 * The colours below were sampled from the provided brand assets. If the
 * manual is updated, adjust these values accordingly.
 */
module.exports = {
  content: [
    "./src/**/*.{ts,tsx,js,jsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#012BA4', // deep royal blue
          dark: '#001E80',    // darker variant
          light: '#0A4DC9',   // lighter variant
        },
        secondary: {
          DEFAULT: '#E8002B', // vibrant red
          dark: '#C20024',    // darker red
          light: '#FF3F60',   // lighter red
        },
        neutral: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
      },
      fontFamily: {
        sans: ['Montserrat', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Open Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};