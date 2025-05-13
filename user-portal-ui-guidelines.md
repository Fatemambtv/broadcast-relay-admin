# User Portal UI Guidelines

 Design Principles
- Use the same color scheme as the admin portal (blue gradient theme)
- Keep the interface simple and intuitive
- Focus on the streaming experience
- Maintain consistency with the admin portal

 Color Palette
- Primary Color: #4a86e8 (Blue)
- Primary Light: #c9daf8 (Light Blue)
- Primary Dark: #1a56cc (Dark Blue)
- Accent Color: #9fc5e8 (Sky Blue)
- Text Color: #333333 (Dark Gray)
- Background: #f3f8ff (Very Light Blue)
- Success: #6aa84f (Green)
- Error: #cc0000 (Red)
- Warning: #f1c232 (Yellow)

 Typography
- Font Family: 'Poppins', sans-serif
- Headings: 600 weight (semi-bold)
- Body Text: 400 weight (regular)
- Buttons: 500 weight (medium)

 Components to Include

# 1. Login Screen
- Similar to admin portal but with user-specific messaging
- Add "Remember Me" option
- Include "Forgot Password" link
- Use the same logo but with "User Portal" text

# 2. Stream Selection Screen
- Card-based layout for available streams
- Each card should show:
  - Stream name
  - Status indicator (live/offline)
  - Preview thumbnail if available
  - "Watch" button

# 3. Video Player Screen
- Large, responsive video player
- Stream information panel
- Quality selection dropdown
- Volume controls
- Fullscreen option
- Chat panel (if applicable)
- "Back to Streams" button

# 4. User Profile Section
- Profile picture upload
- Name and contact information
- Password change option
- Notification preferences
- Viewing history (if applicable)

# 5. Notification Area
- Toast notifications for important events
- Status updates for streams
- System announcements

 Layout Guidelines
- Use responsive design for all screens
- Mobile-first approach
- Maximum width for content containers: 1200px
- Consistent padding and margins (20px base unit)
- Card-based UI elements with subtle shadows
- Rounded corners (8-12px radius)

 Animation Guidelines
- Subtle hover effects on interactive elements
- Smooth transitions between states (0.3s duration)
- Loading indicators for asynchronous operations
- Avoid excessive animations that might distract users

 Accessibility Considerations
- Maintain contrast ratios for text readability
- Include focus indicators for keyboard navigation
- Provide alternative text for images
- Ensure interactive elements have appropriate sizing for touch targets

 Implementation Notes
- Use the same CSS variables defined in the admin portal
- Reuse component styles where appropriate
- Implement dark mode toggle if time permits
- Ensure consistent cross-browser compatibility