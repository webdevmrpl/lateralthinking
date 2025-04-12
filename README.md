# 🧠 Lateral Thinking Game

An interactive puzzle game where players solve lateral thinking mysteries by asking questions. Powered by GPT-4o-mini, the system guides users through structured puzzles without spoiling the solution—encouraging creativity, deduction, and persistence.

---

## 🚀 Project Setup
### Prerequisites
- Visual Studio Code (VS Code)
- Docker
- Node.js (for frontend)
- Python (for backend)

### Steps to Set Up the Project

1. Open the Project in VS Code
   - Open the project folder in VS Code.
2. Set Up OpenAI API Key
   - Add your OpenAI API key to var.env:
      ```env
      OPENAI_API_KEY=your_openai_api_key_here
      ```
3. Set Up Dev Containers
   - Download the Dev Containers extension in VS Code.
   - Press CMD + Shift + R (Mac) or Ctrl + Shift + P (Windows/Linux).
   - Choose Rebuild and Reopen in Container.
   - The docker-compose.devcontainer.yml file will launch the environment, mounting the local code into the container.

4. Run the Backend
   - Open a terminal inside the dev container.
   - Run the following command:
      ```bash
      uvicorn backend.main:app --host 0.0.0.0 --port 8001
      ```
   - The backend will be accessible at http://localhost:8001.

5. Run the Frontend
   - Navigate to the frontend directory:
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
     
   - The frontend will be accessible at http://localhost:3000.

6. Add Stories to MongoDB
   - Inside the dev container, open a terminal.
   - Run the following command to import data into MongoDB:
      ```bash
      python -m backend.import_data
      ```
     

### Additional Notes
- Ensure Docker is running before setting up the dev container.
- If you encounter issues, check the logs in the terminal or restart the dev container.

---

## 🧩 Gameplay Highlights

- Each puzzle has a title, situation, solution, and multiple key points the player must uncover.
- The assistant reveals hints only when requested and tracks the player's progress.
- Players must deduce all key points to solve a puzzle—no direct spoilers allowed!
- Example puzzle:
  > Title: The Office Zombie  
  > Situation: A man shows up daily looking like a zombie. No one questions him. Why?  
  > Solution: He’s a film makeup artist testing effects.  
  > Key Points:  
  > 1. He works in film production.  
  > 2. He wears a zombie costume as part of his job.

---

## ⚙️ Architecture at a Glance

- Frontend: React app with client-side routing, chat-based UI, and celebratory animations (confetti).
- Backend: FastAPI app serving puzzle data and managing game sessions.
- Database: MongoDB stores puzzles and conversation states.
- AI Engine: GPT-4o-mini drives conversation and puzzle progression.
- Dev Setup: Fully Dockerized, optimized for VS Code Dev Containers.

---

## Lessons & Challenges

- What worked: Async backend with FastAPI, schema-flexible MongoDB, and Docker for consistent environments.
- What was tricky: Tuning AI difficulty, ensuring hint balance, validating generated puzzles, and maintaining player engagement.