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

### 3. Build the Application

Run the build command to generate the production-ready files in the `dist` folder:

```bash
npm run build
```

This command uses Vite to compile your TypeScript and React code.

### 4. Deploy to Firebase

Finally, deploy the contents of the `dist` folder to Firebase Hosting:

```bash
firebase deploy --only hosting
```

After the command completes, you will see a `Hosting URL` in the terminal. Open that URL to view your deployed application.

### 5. First Run

When you open the deployed application for the first time, you will be greeted with a "BYOK Protocol Activation" screen.

1.  Enter your **Google Gemini API Key**.
2.  The app will verify the key by making a small test request.
3.  Once verified, the key is stored securely in your browser's local storage for future use.
4.  You can clear the key at any time by clicking the "Logout" icon in the top right corner.

## Troubleshooting

-   **Blank Page**: If you see a blank page, check the browser console for errors. Ensure that `firebase.json` has the rewrite rule configured correctly (it should rewrite all routes to `/index.html`).
-   **API Key Issues**: If you see "Authorization Error", your key may be invalid or expired. Click the Logout button to clear it and enter a new one.
