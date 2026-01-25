# CSS Variables Guide - Manage All Styles from One Place

## 📍 Location
All CSS variables are defined in `src/App.css` in the `:root` selector.

## 🎨 How to Change Colors

### Primary Color (Main Brand Color)
```css
:root {
  --color-primary: #667eea;        /* Change this for main color */
  --color-primary-dark: #5568d3;   /* Darker shade */
  --color-primary-light: #8b9ef0;  /* Lighter shade */
}
```

### Button Colors
```css
:root {
  --button-primary-bg: #1a1a1a;      /* Primary button background */
  --button-primary-color: #ffffff;   /* Primary button text */
  --button-primary-hover: #333333;   /* Hover state */
}
```

### Success/Error/Warning Colors
```css
:root {
  --color-success: #34a853;    /* Green for success */
  --color-error: #ea4335;      /* Red for errors */
  --color-warning: #fbbc04;    /* Yellow for warnings */
}
```

## 🔤 How to Change Fonts

### Font Family
```css
:root {
  --font-family-primary: 'Inter', 'Segoe UI', 'Roboto', sans-serif;
}
```

### Font Sizes
```css
:root {
  --font-size-base: 1rem;      /* 16px - Base size */
  --font-size-lg: 1.125rem;    /* 18px */
  --font-size-xl: 1.25rem;     /* 20px */
  --font-size-2xl: 1.5rem;     /* 24px */
  --font-size-3xl: 2rem;       /* 32px */
}
```

### Font Weights
```css
:root {
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
}
```

## 📏 Spacing

```css
:root {
  --spacing-sm: 0.5rem;    /* 8px */
  --spacing-md: 1rem;      /* 16px */
  --spacing-lg: 1.5rem;    /* 24px */
  --spacing-xl: 2rem;      /* 32px */
}
```

## 🔲 Border Radius

```css
:root {
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
}
```

## 🌑 Shadows

```css
:root {
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
}
```

## 💡 Usage Examples

### In Your CSS Files
```css
.my-button {
  background: var(--button-primary-bg);
  color: var(--button-primary-color);
  padding: var(--spacing-md);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-base);
  font-family: var(--font-family-primary);
}

.my-card {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-lg);
}
```

### In React Components (Inline Styles)
```jsx
<div style={{
  backgroundColor: 'var(--color-primary)',
  padding: 'var(--spacing-md)',
  borderRadius: 'var(--radius-lg)'
}}>
  Content
</div>
```

## 🎯 Quick Change Examples

### Change All Primary Buttons to Blue
```css
:root {
  --button-primary-bg: #1a73e8;
  --button-primary-hover: #0b57d0;
}
```

### Change All Text Colors
```css
:root {
  --color-text-primary: #1a1a1a;    /* Main text */
  --color-text-secondary: #333333;  /* Secondary text */
  --color-text-tertiary: #666666;   /* Tertiary text */
}
```

### Change All Border Colors
```css
:root {
  --color-border: #e0e0e0;        /* Default border */
  --color-border-focus: #667eea;  /* Focus border */
}
```

### Change Font Family App-Wide
```css
:root {
  --font-family-primary: 'Roboto', sans-serif;
}
```

## 📋 Available Variables

### Colors
- Primary: `--color-primary`, `--color-primary-dark`, `--color-primary-light`
- Secondary: `--color-secondary`, `--color-secondary-dark`
- Success: `--color-success`, `--color-success-dark`
- Error: `--color-error`, `--color-error-dark`
- Warning: `--color-warning`, `--color-warning-dark`
- Background: `--color-bg-primary`, `--color-bg-secondary`
- Text: `--color-text-primary`, `--color-text-secondary`, `--color-text-tertiary`
- Border: `--color-border`, `--color-border-light`, `--color-border-focus`

### Buttons
- Primary: `--button-primary-bg`, `--button-primary-color`, `--button-primary-hover`
- Secondary: `--button-secondary-bg`, `--button-secondary-color`
- Success: `--button-success-bg`, `--button-success-hover`
- Error: `--button-error-bg`, `--button-error-hover`

### Typography
- Font Family: `--font-family-primary`, `--font-family-secondary`
- Font Sizes: `--font-size-xs` to `--font-size-4xl`
- Font Weights: `--font-weight-light` to `--font-weight-bold`

### Spacing
- `--spacing-xs` to `--spacing-3xl`

### Border Radius
- `--radius-sm` to `--radius-full`

### Shadows
- `--shadow-sm` to `--shadow-2xl`

## ✅ Benefits

1. **Single Source of Truth** - Change colors/fonts in one place
2. **Consistency** - All components use same variables
3. **Easy Theming** - Switch themes by changing variables
4. **Maintainability** - Update once, applies everywhere
5. **Type Safety** - Less chance of typos in color codes

## 🚀 Next Steps

1. Open `src/App.css`
2. Find the `:root` section at the top
3. Change any variable value
4. Save - changes apply everywhere!

**All styles are now managed from `src/App.css`!** 🎨


