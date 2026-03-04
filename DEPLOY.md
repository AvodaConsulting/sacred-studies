# Deploying to Firebase Hosting

This guide explains how to deploy your Sacred Studies AI application to Firebase Hosting.

## Prerequisites

1.  **Node.js**: Ensure you have Node.js installed.
2.  **Firebase CLI**: Install the Firebase CLI globally if you haven't already:
    ```bash
    npm install -g firebase-tools
    ```
3.  **Firebase Account**: Sign up or log in to [Firebase Console](https://console.firebase.google.com/).

## Steps

### 1. Login to Firebase

Open your terminal in the project directory and log in:

```bash
firebase login
```

### 2. Initialize Firebase Project

If you haven't already created a Firebase project in the console, do so now. Then, link this local directory to your Firebase project:

```bash
firebase init hosting
```

-   **Select a project**: Choose "Use an existing project" and select your project from the list.
-   **Public directory**: Type `dist` (this is where Vite builds the app).
-   **Configure as a single-page app**: Type `y` (Yes).
-   **Set up automatic builds and deploys with GitHub**: Type `n` (No) for now, unless you want to set up CI/CD.
-   **File `dist/index.html` already exists. Overwrite?**: Type `n` (No) if asked.

### 3. Configure Environment Variables

The application requires a Gemini API key. Since this is a client-side application, the key is bundled during the build process.

Create a `.env` file in the root directory (if it doesn't exist) and add your API key:

```env
GEMINI_API_KEY=your_actual_api_key_here
```

**Important**: Do not commit this file to version control if your repository is public.

### 4. Build the Application

Run the build command to generate the production-ready files in the `dist` folder:

```bash
npm run build
```

This command uses Vite to compile your TypeScript and React code, injecting the environment variables defined in `.env`.

### 5. Deploy to Firebase

Finally, deploy the contents of the `dist` folder to Firebase Hosting:

```bash
firebase deploy --only hosting
```

After the command completes, you will see a `Hosting URL` in the terminal. Open that URL to view your deployed application.

## Troubleshooting

-   **Blank Page**: If you see a blank page, check the browser console for errors. Ensure that `firebase.json` has the rewrite rule configured correctly (it should rewrite all routes to `/index.html`).
-   **API Key Issues**: If the AI features don't work, ensure that `GEMINI_API_KEY` was correctly set in your `.env` file before running `npm run build`. You can verify this by inspecting the network requests in the browser developer tools.
