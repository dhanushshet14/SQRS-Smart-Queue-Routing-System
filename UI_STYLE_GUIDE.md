# 🎨 UI Style Guide - AI Smart Queue Routing System

## Color Palette

### Primary Colors (Warm Gradient)
- **Warm Orange**: `#ff7849` - Primary accent, buttons, highlights
- **Warm Pink**: `#ff6b9d` - Secondary accent, badges
- **Warm Purple**: `#c44569` - Tertiary accent
- **Warm Blue**: `#546de5` - Info elements
- **Warm Teal**: `#3dc1d3` - Success states, available status

### Background Colors
- **Dark Slate**: `#1e293b` - Primary background
- **Medium Slate**: `#334155` - Secondary background
- **Light Slate**: `#475569` - Tertiary background

### Status Colors
- **Available**: `#3dc1d3` (Warm Teal)
- **Busy**: `#ff7849` (Warm Orange)
- **Offline**: `#778ca3` (Gray)

### Routing Score Colors
- **High (≥0.8)**: `#00d2d3` (Warm Teal)
- **Medium (0.6-0.79)**: `#ff7849` (Warm Orange)
- **Low (<0.6)**: `#ff6b9d` (Warm Pink)

## Form Elements

### Input Fields
```css
background: linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(51, 65, 85, 0.8))
border: 1px solid rgba(255, 120, 73, 0.3)
color: white
border-radius: 0.75rem
padding: 0.75rem 1rem
```

**Focus State:**
```css
border-color: #ff7849
box-shadow: 0 0 0 2px rgba(255, 120, 73, 0.2)
```

### Select Dropdowns
```css
background: linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(51, 65, 85, 0.8))
border: 1px solid rgba(255, 120, 73, 0.3)
color: white
```

**Options:**
```css
background-color: #1e293b
color: white
```

### Sliders
```css
/* Track */
background: #374151
height: 8px
border-radius: 4px

/* Thumb */
background: linear-gradient(135deg, #ff7849, #ff6b9d)
width: 20px
height: 20px
border-radius: 50%
box-shadow: 0 2px 8px rgba(255, 120, 73, 0.3)
```

### Buttons

**Primary Button (Warm Gradient):**
```css
background: linear-gradient(135deg, #ff7849, #ff6b9d)
color: white
font-weight: 600
padding: 0.75rem 1.5rem
border-radius: 1rem
```

**Secondary Button:**
```css
background: rgba(255, 255, 255, 0.1)
backdrop-filter: blur(10px)
border: 1px solid rgba(255, 255, 255, 0.2)
color: white
```

**Success Button:**
```css
background: rgba(0, 210, 211, 0.2)
border: 1px solid rgba(0, 210, 211, 0.3)
color: #3dc1d3
```

**Danger Button:**
```css
background: rgba(255, 107, 157, 0.2)
border: 1px solid rgba(255, 107, 157, 0.3)
color: #ff6b9d
```

### Toggle Switches
```css
/* Off State */
background: rgba(255, 255, 255, 0.2)

/* On State */
background: linear-gradient(135deg, #ff7849, #ff6b9d)
```

## Cards & Containers

### Glass Morphism Cards
```css
background: rgba(255, 255, 255, 0.1)
backdrop-filter: blur(10px)
border: 1px solid rgba(255, 255, 255, 0.2)
border-radius: 1.5rem
```

### Modal Backdrop
```css
background: rgba(0, 0, 0, 0.5)
backdrop-filter: blur(8px)
```

### Modal Container
```css
background: linear-gradient(to bottom right, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))
backdrop-filter: blur(10px)
border: 1px solid rgba(255, 255, 255, 0.2)
border-radius: 1.5rem
```

## Typography

### Font Family
```css
font-family: 'Inter', system-ui, sans-serif
```

### Headings
- **H1**: `text-3xl font-bold text-white` (30px)
- **H2**: `text-2xl font-bold text-white` (24px)
- **H3**: `text-xl font-semibold text-white` (20px)
- **H4**: `text-lg font-medium text-white` (18px)

### Body Text
- **Primary**: `text-white`
- **Secondary**: `text-white/80` (80% opacity)
- **Tertiary**: `text-white/60` (60% opacity)
- **Muted**: `text-white/50` (50% opacity)

## Spacing

### Padding
- **Small**: `p-2` (0.5rem)
- **Medium**: `p-4` (1rem)
- **Large**: `p-6` (1.5rem)
- **Extra Large**: `p-8` (2rem)

### Margin
- **Small**: `m-2` (0.5rem)
- **Medium**: `m-4` (1rem)
- **Large**: `m-6` (1.5rem)
- **Extra Large**: `m-8` (2rem)

### Gap
- **Small**: `gap-2` (0.5rem)
- **Medium**: `gap-4` (1rem)
- **Large**: `gap-6` (1.5rem)

## Animations

### Transitions
```css
transition: all 0.3s ease
```

### Hover Effects
```css
/* Scale */
transform: scale(1.05)

/* Opacity */
opacity: 0.9

/* Shadow */
box-shadow: 0 4px 12px rgba(255, 120, 73, 0.3)
```

### Loading Spinner
```css
animate-spin rounded-full h-4 w-4 border-b-2 border-white
```

## Shadows

### Card Shadow
```css
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1)
```

### Elevated Shadow
```css
box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2)
```

### Glow Effect
```css
box-shadow: 0 0 20px rgba(255, 120, 73, 0.5)
```

## Borders

### Default Border
```css
border: 1px solid rgba(255, 255, 255, 0.2)
```

### Accent Border
```css
border: 1px solid rgba(255, 120, 73, 0.3)
```

### Focus Border
```css
border: 1px solid #ff7849
```

## Gradients

### Warm Gradient (Primary)
```css
background: linear-gradient(135deg, #ff7849 0%, #ff6b9d 25%, #c44569 50%, #546de5 75%, #3dc1d3 100%)
```

### Soft Warm Gradient
```css
background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 25%, #fd79a8 50%, #6c5ce7 75%, #74b9ff 100%)
```

### Card Gradient
```css
background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)
```

## Usage Examples

### Input Field
```tsx
<input
  type="text"
  className="w-full bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-md border border-warm-orange/30 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:border-warm-orange focus:ring-2 focus:ring-warm-orange/20 transition-all duration-300"
  placeholder="Enter text"
/>
```

### Button
```tsx
<button className="bg-warm-gradient text-white font-semibold px-6 py-3 rounded-2xl hover:opacity-90 transition-all duration-300">
  Click Me
</button>
```

### Card
```tsx
<div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 shadow-2xl">
  Card Content
</div>
```

### Badge
```tsx
<span className="bg-warm-teal/20 text-warm-teal px-3 py-1 rounded-full text-sm font-semibold">
  Available
</span>
```

## Accessibility

### Focus Indicators
All interactive elements must have visible focus states:
```css
focus:ring-2 focus:ring-warm-orange/20 focus:border-warm-orange
```

### Color Contrast
- Ensure text has sufficient contrast against backgrounds
- Minimum contrast ratio: 4.5:1 for normal text
- Minimum contrast ratio: 3:1 for large text

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Use proper semantic HTML elements
- Provide skip links for navigation

## Best Practices

1. **Consistency**: Use the same styling patterns throughout the app
2. **Hierarchy**: Use size, weight, and color to establish visual hierarchy
3. **Spacing**: Maintain consistent spacing between elements
4. **Feedback**: Provide visual feedback for all user interactions
5. **Performance**: Use CSS transforms for animations (not position/size)
6. **Accessibility**: Always consider keyboard navigation and screen readers

## Component-Specific Guidelines

### Dashboard
- Use glass morphism for panels
- Maintain consistent card heights
- Use warm gradient for action buttons

### Modals
- Always include backdrop blur
- Center content vertically and horizontally
- Include close button in top-right corner

### Forms
- Group related fields together
- Use consistent spacing between fields
- Provide clear labels and placeholders
- Show validation errors inline

### Tables
- Use alternating row colors for readability
- Highlight rows on hover
- Make headers sticky for long tables

---

**Remember**: The goal is to create a cohesive, modern, and accessible interface that reflects the AI-powered nature of the application while maintaining excellent usability.
