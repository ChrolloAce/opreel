# OpReel - YouTube Content Planner

A beautiful, YouTube-inspired content planning dashboard built with Next.js, TypeScript, Tailwind CSS, and Firebase.

## Features

- 🎬 **YouTube-Style Interface** - Familiar grid layout with thumbnails and metadata
- 🔐 **Google Authentication** - Secure sign-in with Firebase Auth
- ✏️ **Inline Editing** - Click titles to edit them instantly
- 🖼️ **Thumbnail Management** - Click thumbnails to upload new images
- 🗑️ **Content Management** - Delete items via dropdown menu
- ⌨️ **Keyboard Shortcuts** - Press Space to quick-add content
- 🔍 **Filtering & Search** - Filter by platform, status, or search text
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🔥 **Firebase Integration** - User data stored securely per account

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Authentication**: Firebase Auth (Google Sign-In)
- **Database**: Cloud Firestore
- **Storage**: Firebase Storage

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase project with Authentication, Firestore, and Storage enabled

### Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/ChrolloAce/opreel.git
cd opreel
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up Firebase:
   - Create a Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com)
   - Enable Google Authentication
   - Enable Cloud Firestore
   - Enable Cloud Storage
   - Deploy the Firestore and Storage rules (see below)

4. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Firebase Setup

### Deploy Firestore Rules

\`\`\`bash
firebase deploy --only firestore:rules
\`\`\`

### Deploy Storage Rules

\`\`\`bash
firebase deploy --only storage:rules
\`\`\`

## Usage

### Keyboard Shortcuts

- **Space**: Open Quick Add dialog
- **Enter**: Save title when editing
- **Escape**: Cancel title editing or close dialog

### Managing Content

1. **Add Content**: Press Space or use the Quick Add dialog
2. **Edit Title**: Click any video title and start typing
3. **Upload Thumbnail**: Click the thumbnail image to select a new file
4. **Delete Content**: Click the three-dot menu → Delete
5. **Filter**: Use tabs at the top or sidebar filters
6. **Search**: Type in the search bar to find content

## Project Structure

\`\`\`
opreel/
├── app/
│   ├── dashboard/
│   │   └── page.tsx          # Main dashboard page
│   ├── layout.tsx             # Root layout with AuthProvider
│   └── globals.css            # Global styles
├── components/
│   ├── auth/
│   │   └── login-screen.tsx   # Google sign-in screen
│   ├── dashboard/
│   │   ├── sidebar.tsx        # Navigation sidebar
│   │   ├── header.tsx         # Search & filters
│   │   ├── content-card.tsx   # Individual video card
│   │   ├── content-grid.tsx   # Grid layout
│   │   └── quick-add-panel.tsx # Bulk/single add form
│   └── ui/                    # shadcn/ui components
├── lib/
│   ├── firebase.ts            # Firebase configuration
│   ├── auth-context.tsx       # Authentication context
│   ├── content-data.ts        # TypeScript types
│   └── utils.ts               # Utility functions
├── firestore.rules            # Firestore security rules
└── storage.rules              # Storage security rules
\`\`\`

## Security

- All user data is isolated per account
- Firestore rules prevent cross-user data access
- Storage rules enforce file size limits and type validation
- Authentication required for all operations

## License

MIT

## Author

Built with ❤️ by ChrolloAce
