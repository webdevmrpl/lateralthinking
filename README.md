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

1. **Clone and Open the Project**
   - Clone the repository and open the project folder in your preferred editor.

2. **Set Up Environment Variables**
   - Create a `var.env` file in the `backend` directory:
      ```env
      OPENAI_API_KEY=your_openai_api_key_here
      ```

3. **Start the Application with Docker Compose**
   - Ensure Docker is running on your system.
   - From the project root directory, run:
      ```bash
      docker-compose up --build
      ```
   - This command will:
     - Build and start the backend service (FastAPI)
     - Build and start the frontend service (React)
     - Start MongoDB database
     - Set up networking between all services

4. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8001

5. **Stop the Application**
   - To stop all services:
      ```bash
      docker-compose down
      ```

### Additional Notes
- Ensure Docker is running before starting the application.
- All services will start automatically with `docker-compose up`.
- If you encounter issues, check the logs with `docker compose logs [service-name]` or restart with `docker compose restart`.

---

## 🧩 Gameplay Highlights

- Each puzzle has a title, situation, solution, and multiple key points the player must uncover.
- The assistant reveals hints only when requested and tracks the player's progress.
- Players must deduce all key points to solve a puzzle—no direct spoilers allowed!
- Example puzzle:
  > Title: The Office Zombie  
  > Situation: A man shows up daily looking like a zombie. No one questions him. Why?  
  > Solution: He's a film makeup artist testing effects.  
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