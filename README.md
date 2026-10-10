# Nexora AI – Intelligent DevOps Workspace

[![CI/CD Pipeline](https://github.com/USER/nexora-ai-devops-manager/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/USER/nexora-ai-devops-manager/actions)
[![Docker Image](https://img.shields.io/badge/docker-multi--stage-blue.svg)](https://www.docker.com/)
[![React 19](https://img.shields.io/badge/react-v19.0-61dafb.svg)](https://react.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Nexora AI** is an intelligent, high-performance DevOps & Cybersecurity task management workspace designed for engineering teams and DevOps practitioners. It combines modern sprint tracking, transparent rule-based local intelligence, real-time workload telemetry, multi-stage Docker containerization, and automated GitHub Actions CI/CD pipelines.

---

## 1. Project Overview & Features

Nexora AI is built for real-world DevOps workflows, providing:

- **Executive DevOps Dashboard**:
  - Real-time KPI counters: Total tasks, active execution (In Progress), resolved (Completed), and overdue SLA items.
  - Overall sprint completion velocity bar with health scoring.
  - Visual workload charts by Priority tiers (`Critical`, `High`, `Medium`, `Low`) and categories (`Security`, `CI/CD`, `Cloud`, `DevOps`, `Infrastructure`, `Monitoring`, `Testing`).
  - Upcoming deadlines widget with dynamic day count warnings.
  - Contextual Daily Productivity Summary dynamically computed from actual workspace data.

- **DevOps Task Management (Full CRUD & Dual Views)**:
  - **List & Table View**: Detailed records with status checkboxes, badges, tags, and inline controls.
  - **Kanban Board View**: Three distinct sprint lanes (`Backlog / To Do`, `In Execution`, `Completed / Deployed`) with one-click transitions.
  - Multi-attribute search by title, description, and tags.
  - Granular filtering by Status, Priority tier, and Category.
  - Flexible sorting (Due date, Priority urgency, Date created, Alphabetical).
  - Permanent task deletion with modal safety confirmation.

- **Nexora Smart Assistant (100% Offline Rule-Based Engine)**:
  - **Zero External APIs / Privacy-First**: Operates strictly client-side within the browser.
  - **Urgency Scoring Algorithm**: Evaluates active tickets using a deterministic formula:
    $$\text{Score} = \text{PriorityWeight} + \text{DueDateUrgency} + \text{WIPBonus} + \text{DomainWeight}$$
  - **Next Task Recommendation**: Pinpoints the single highest-priority task and explains the exact rationale.
  - **Natural Language Command Parser**: Translates prompts like *"Add a high-priority task called Test Docker deployment due tomorrow"* or *"Create critical security task Audit Kubernetes RBAC"* into validated task entries.
  - **Incident & Overdue Triage Center**: Flags SLA violations and unmitigated security risks for rapid resolution.

- **Internship DevOps & CI/CD Hub**:
  - Embedded interactive guides for Git repository setup, Docker build & run commands, GitHub Actions workflow visualizer, and cloud deployment.

- **Workspace Data Management & Portability**:
  - Full persistence using browser `LocalStorage`.
  - JSON Backup export and JSON restore functionality.
  - One-click restore to authentic DevOps/Cybersecurity demo fixtures.
  - Hard reset / wipe functionality with confirmation dialogs.

---

## 2. Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 + TypeScript | Component-based user interface with strict static typing |
| **Build Tool** | Vite 8 | Ultra-fast Hot Module Replacement and production bundling |
| **Styling** | Tailwind CSS v4 | Refined dark charcoal developer UI with restrained typography and hairline borders |
| **Icons** | Lucide React | Clean, scalable vector system iconography |
| **Persistence** | Browser LocalStorage | Zero-latency, client-side data isolation |
| **Containerization** | Docker + Alpine Nginx | Multi-stage build producing an ultra-lightweight (&lt;25MB) container |
| **CI/CD** | GitHub Actions | Automated build validation and Docker container smoke tests |

---

## 3. Folder Structure

```
nexora-ai-devops-manager/
├── .github/
│   └── workflows/
│       └── ci-cd.yml           # GitHub Actions CI/CD automation workflow
├── src/
│   ├── components/
│   │   ├── ConfirmModal.tsx    # Safety confirmation dialog for deletions/resets
│   │   ├── DashboardView.tsx   # KPI metrics, velocity charts, & deadlines
│   │   ├── DevOpsHubView.tsx   # Interactive Docker, CI/CD, and Git guides
│   │   ├── Navbar.tsx          # Top branding, engine status, and actions
│   │   ├── SettingsView.tsx    # Storage telemetry, JSON backup, and fixtures
│   │   ├── Sidebar.tsx         # Collapsible desktop navigation bar
│   │   ├── SmartAssistantView.tsx # Local NLP parser & recommendation engine
│   │   ├── TaskManagementView.tsx # List and Kanban views with filters & sorting
│   │   ├── TaskModal.tsx       # Task creation and editing dialog
│   │   └── Toast.tsx           # Floating feedback notification system
│   ├── services/
│   │   ├── assistantEngine.ts  # Deterministic NLP parser and scoring algorithms
│   │   └── storage.ts          # LocalStorage CRUD, export/import, demo data
│   ├── App.tsx                 # Core application controller and layout state
│   ├── index.css               # Tailwind CSS imports and custom aesthetic styling
│   ├── main.tsx                # React DOM root entry point
│   └── types.ts                # TypeScript interfaces and data contracts
├── .dockerignore               # Patterns excluded from Docker builds
├── .env.example                # Template for environment configuration
├── .gitignore                  # Git repository exclusion list
├── Dockerfile                  # Multi-stage production container manifest
├── index.html                  # HTML entry point with meta tags & fonts
├── nginx.conf                  # Production web server configuration with SPA routing
├── package.json                # Project dependencies and script declarations
├── tsconfig.json               # TypeScript compiler configuration
├── vite.config.ts              # Vite bundling pipeline configuration
└── README.md                   # Comprehensive project documentation
```

---

## 4. Prerequisites

Before running the application locally or in containers, ensure you have:

- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **npm**: `v10.x` or later
- **Docker**: `v24.x` or later (for containerized deployment)
- **Git**: `v2.40` or later

---

## 5. Local Installation and Execution

### Step 1: Clone the repository
```bash
git clone https://github.com/<YOUR-USERNAME>/nexora-ai-devops-manager.git
cd nexora-ai-devops-manager
```

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Start the local development server
```bash
npm run dev
```

The application will start on `http://localhost:3000` (or the configured Vite port). Open your browser to explore the dashboard.

---

## 6. Production Build Instructions

To verify that the TypeScript codebase compiles cleanly and produces optimized static assets:

```bash
# Compile and build production bundle
npm run build
```

This outputs production-ready HTML, JavaScript, and CSS assets to the `dist/` folder.

To preview the production build locally:
```bash
npm run preview
```

---

## 7. Docker Instructions (Task 3)

The repository includes a production-grade multi-stage `Dockerfile` paired with an optimized `nginx.conf`:

- **Stage 1 (Builder)**: Uses `node:22-alpine` to cleanly install dependencies using `package-lock.json` and compile Vite production assets into `/app/dist`.
- **Stage 2 (Runner)**: Copies the built artifacts into `nginx:alpine` and configures client-side SPA route fallbacks (`try_files $uri $uri/ /index.html;`) and security headers.
- **Port Mapping**: The container listens internally on **Port 80** and is mapped to host **Port 8080** (`-p 8080:80`).

---

### A. Windows Docker Desktop Instructions

#### 1. Prerequisites on Windows
1. Install [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/) (WSL 2 backend recommended).
2. Start Docker Desktop and verify the status indicator in the bottom-left shows **Engine running** (green).

#### 2. Project Export & Setup on Windows
1. Download or export the project files from Google AI Studio into a folder on your Windows machine (e.g., `C:\Projects\nexora-ai-devops-manager`).
2. Open **PowerShell**, **Windows Terminal**, or **Command Prompt (CMD)** as Administrator or standard user.
3. Navigate into the project root directory where `Dockerfile` and `nginx.conf` reside:
   ```powershell
   cd C:\Projects\nexora-ai-devops-manager
   ```

#### 3. Step-by-Step Command Execution

**Step 1: Build the Docker Image**
```powershell
docker build -t nexora-ai-devops-manager:latest .
```
*(Docker will run the multi-stage build: downloading Node 22 Alpine, installing dependencies via npm ci, running `npm run build`, and packaging the output into Nginx Alpine).*

**Step 2: Run the Container**
```powershell
docker run -d -p 8080:80 --name nexora-app nexora-ai-devops-manager:latest
```
- `-d`: Runs the container in detached (background) mode.
- `-p 8080:80`: Maps host port `8080` to container port `80`.
- `--name nexora-app`: Assigns a friendly name for easy management.

**Step 3: Verify Container Status & Access the Web App**
```powershell
docker ps
```
Open your browser (Edge, Chrome, or Firefox) and navigate to:
```
http://localhost:8080
```
You should see the Nexora AI DevOps Workspace dashboard running smoothly with all routes and local state active.

**Step 4: View Container Logs**
```powershell
# View recent logs
docker logs nexora-app

# Or stream logs live (Ctrl+C to exit)
docker logs -f nexora-app
```

**Step 5: Stop the Container**
```powershell
docker stop nexora-app
```

**Step 6: Remove the Container**
```powershell
docker rm nexora-app
```

---

### B. Managing via Docker Desktop GUI (Windows)

If you prefer using the graphical interface:
1. Open the **Docker Desktop** window.
2. Click the **Containers** tab on the left sidebar: you will see `nexora-app` running with status `Port 8080:80`.
3. Click on the container name to view:
   - **Logs tab**: Live Nginx access logs and health checks.
   - **Inspect tab**: Environment variables, port bindings, and container IP.
   - **Terminal (Exec) tab**: Interactive shell inside the running Alpine container.
4. Use the **Stop (Square)** and **Delete (Trash can)** buttons in the top-right corner to stop and remove the container.

---

### C. Docker Troubleshooting on Windows

| Issue | Cause | Resolution |
| :--- | :--- | :--- |
| `docker: error during connect: This error may indicate that the docker daemon is not running` | Docker Desktop is not started | Launch Docker Desktop from the Start menu and wait until the whale icon shows "Engine running". |
| `Bind for 0.0.0.0:8080 failed: port is already allocated` | Another application is using port 8080 | Map to an alternate port, e.g.: `docker run -d -p 8085:80 --name nexora-app nexora-ai-devops-manager:latest` and open `http://localhost:8085`. |
| `COPY failed: file not found in build context: package-lock.json` | Lockfile not included in directory | Ensure `package.json` and `package-lock.json` are in the folder. Our Dockerfile handles fallback automatically. |
| SPA subpages return 404 | Nginx not configured for client routing | Handled: `nginx.conf` includes `try_files $uri $uri/ /index.html;`. |

---

## 8. GitHub Actions CI/CD Pipeline (Task 4)

The pipeline configuration is stored at `.github/workflows/ci-cd.yml` and is triggered on every **push** or **pull request** to the `main` branch.

### Workflow Stages:
1. **Checkout Code**: Checks out the branch using `actions/checkout@v4`.
2. **Setup Node**: Prepares Node.js 22 with automated npm dependency caching.
3. **Clean Install**: Runs `npm ci` for deterministic package resolution.
4. **Build Verification**: Runs `npm run build` and ensures `dist/index.html` is properly generated.
5. **Docker Build & Smoke Test**:
   - Builds the Docker image: `docker build -t nexora-ai-devops-manager:${{ github.sha }} .`
   - Spawns the container in the background and issues an HTTP health check (`curl -f http://localhost:8080/`).

*Note:* In accordance with DevOps best practices, this pipeline does not expose or require production secrets to execute validation tests.

---

## 9. GitHub Repository Publishing Steps (Task 2)

Follow these steps to publish this codebase to your personal or organization GitHub account:

```bash
# 1. Initialize local git repository (if not already done)
git init
git branch -M main

# 2. Stage and commit files
git add .
git commit -m "feat: complete Nexora AI DevOps Workspace implementation"

# 3. Create repository 'nexora-ai-devops-manager' on GitHub (https://github.com/new)
# 4. Link remote origin
git remote add origin https://github.com/<YOUR-USERNAME>/nexora-ai-devops-manager.git

# 5. Push to GitHub
git push -u origin main
```

---

## 10. Cloud Deployment Instructions (Task 5)

### Option A: Deploying on Vercel
1. Sign in to [Vercel](https://vercel.com) and click **Add New Project**.
2. Select and import the `nexora-ai-devops-manager` GitHub repository.
3. Keep default settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **Deploy**. Vercel will build the project and provide a live production URL (e.g., `https://nexora-ai-devops-manager.vercel.app`).
5. Open the live URL to verify responsive layout and task creation.

### Option B: Deploying on Google Cloud Run
1. Authenticate with Google Cloud:
   ```bash
   gcloud auth login
   gcloud config set project <YOUR-PROJECT-ID>
   ```
2. Build and submit container image:
   ```bash
   gcloud builds submit --tag gcr.io/<YOUR-PROJECT-ID>/nexora-workspace
   ```
3. Deploy to Cloud Run:
   ```bash
   gcloud run deploy nexora-workspace \
     --image gcr.io/<YOUR-PROJECT-ID>/nexora-workspace \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --port 80
   ```
4. Access the provided Service URL.

---

## 11. Known Limitations & Future Improvements

- **Local Storage Scope**:
  - Tasks are stored in the user's browser `LocalStorage`.
  - *Limitation:* Data is isolated to the specific device and browser profile; it does not automatically sync across multiple computers unless exported as JSON.
  - *Planned Enhancement:* Add an optional PostgreSQL / Firebase cloud synchronization adapter for multi-user collaboration.
- **Rule-Based Assistant**:
  - The Smart Assistant uses deterministic algorithms (heuristics and regex patterns) rather than large language models.
  - *Advantage:* Zero latency, zero cost, completely offline, and high privacy.
  - *Planned Enhancement:* Add optional BYOK (Bring Your Own Key) toggle for Gemini API / LLM summarization.
- **Role-Based Access Control (RBAC)**:
  - Currently single-user workspace. Future revisions can include role gates (e.g., DevOps Lead vs Security Auditor).

---

## 12. Troubleshooting

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| `port 3000 already in use` | Another process is holding the port | Run `npx kill-port 3000` or specify another port via `vite --port 3001` |
| Tasks reset after private browsing session | Browser incognito mode clears LocalStorage upon window close | Use standard browser profile or use the **Export Tasks (JSON)** button in Settings |
| Docker build fails on `npm ci` | Lockfile discrepancy | Run `npm install` locally to update `package-lock.json`, then rebuild |

---

## 13. License

Distributed under the **MIT License**. Free for educational, internship portfolio, and commercial use.
