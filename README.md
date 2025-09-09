# Post-Meeting Agent

## Running the React UI

The UI is located in the `ui` folder and built with React + Tailwind CSS.

### Steps to run the UI:

1. Open a terminal and navigate to the `ui` folder:
   ```sh
   cd ui
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm run dev
   ```
4. Open your browser and go to the URL shown in the terminal (usually `http://localhost:5173`).

**Note:**
- The backend (FastAPI) should be running and accessible at `http://127.0.0.1:8000` for the UI to work.
- Make sure CORS is enabled in the backend (already configured).
- Upload a `.wav` file to see meeting insights and actions in the UI.


