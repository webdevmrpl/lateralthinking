# Project Setup Guide

This guide provides step-by-step instructions to set up and run the project locally.

## Prerequisites
- Visual Studio Code (VS Code)
- Docker
- Node.js (for frontend)
- Python (for backend)

## Steps to Set Up the Project

1. **Open the Project in VS Code**
   - Open the project folder in VS Code.

2. **Set Up Dev Containers**
   - Download the **Dev Containers** extension in VS Code.
   - Press `CMD + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows/Linux).
   - Choose **Rebuild and Reopen in Container**.
   - The `docker-compose.devcontainer.yml` file will launch the environment, mounting the local code into the container.

3. **Run the Backend**
   - Open a terminal inside the dev container.
   - Run the following command:
     ```bash
     uvicorn main:app --host 0.0.0.0 --port 8001
     ```
   - The backend will be accessible at `http://localhost:8001`.

4. **Run the Frontend**
   - Navigate to the `frontend` directory:
     ```bash
     cd frontend
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Build the frontend:
     ```bash
     npm build
     ```
   - Start the frontend server:
     ```bash
     npm run start
     ```
   - The frontend will be accessible at `http://localhost:3000`.

5. **Add Stories to MongoDB**
   - Inside the dev container, open a terminal.
   - Run the following command to import data into MongoDB:
     ``` bash
     python -m backend.import_data
     ```

## Additional Notes
- Ensure Docker is running before setting up the dev container.
- If you encounter issues, check the logs in the terminal or restart the dev container.

## Support
For any issues or questions, please refer to the project documentation or contact the maintainers.