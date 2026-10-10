import { useState } from 'react';
import { 
  Copy, 
  Check, 
  Box, 
  PlayCircle, 
  GitBranch, 
  Server
} from 'lucide-react';

export function DevOpsHubView() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'docker' | 'cicd' | 'github' | 'deploy'>('docker');

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const dockerfileContent = `# Stage 1: Build React SPA
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production Nginx Server
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`;

  const dockerCommands = `# Build the production Docker image
docker build -t nexora-ai-devops-manager:latest .

# Run container on port 8080
docker run -d -p 8080:80 --name nexora-app nexora-ai-devops-manager:latest

# Verify status & logs
docker ps
docker logs nexora-app`;

  const cicdWorkflow = `name: Nexora AI CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  validate-and-build:
    name: Lint, Build, and Smoke Test
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Build Application
        run: npm run build

      - name: Verify Build Output
        run: test -f dist/index.html

      - name: Build and Test Docker Container
        run: |
          docker build -t nexora-ai-devops-manager:test .
          docker run -d --name test-app -p 8080:80 nexora-ai-devops-manager:test
          sleep 3
          curl -f http://localhost:8080/ || exit 1`;

  const gitCommands = `# Initialize local repository
git init
git branch -M main

# Stage and commit files
git add .
git commit -m "feat: complete Nexora AI DevOps Workspace implementation"

# Add GitHub remote repository
git remote add origin https://github.com/<YOUR-USERNAME>/nexora-ai-devops-manager.git

# Push to GitHub
git push -u origin main`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-[#30363d] pb-4">
        <h1 className="text-xl font-semibold text-[#f0f6fc] tracking-tight">
          DevOps & Deployment Hub
        </h1>
        <p className="text-xs text-[#8b949e] mt-1.5 leading-relaxed">
          Configuration manifests, containerization specifications, CI/CD pipelines, and cloud deployment guides for the internship deliverables.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[#30363d] pb-px text-xs font-medium">
        <button
          onClick={() => setActiveTab('docker')}
          className={`flex items-center gap-2 px-3 py-2 border-b-2 transition-colors ${
            activeTab === 'docker'
              ? 'border-[#1f6feb] text-[#f0f6fc]'
              : 'border-transparent text-[#8b949e] hover:text-[#c9d1d9]'
          }`}
        >
          <Box className="w-4 h-4" />
          <span>Docker Container</span>
        </button>

        <button
          onClick={() => setActiveTab('cicd')}
          className={`flex items-center gap-2 px-3 py-2 border-b-2 transition-colors ${
            activeTab === 'cicd'
              ? 'border-[#1f6feb] text-[#f0f6fc]'
              : 'border-transparent text-[#8b949e] hover:text-[#c9d1d9]'
          }`}
        >
          <PlayCircle className="w-4 h-4" />
          <span>GitHub Actions CI/CD</span>
        </button>

        <button
          onClick={() => setActiveTab('github')}
          className={`flex items-center gap-2 px-3 py-2 border-b-2 transition-colors ${
            activeTab === 'github'
              ? 'border-[#1f6feb] text-[#f0f6fc]'
              : 'border-transparent text-[#8b949e] hover:text-[#c9d1d9]'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          <span>GitHub Setup</span>
        </button>

        <button
          onClick={() => setActiveTab('deploy')}
          className={`flex items-center gap-2 px-3 py-2 border-b-2 transition-colors ${
            activeTab === 'deploy'
              ? 'border-[#1f6feb] text-[#f0f6fc]'
              : 'border-transparent text-[#8b949e] hover:text-[#c9d1d9]'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Cloud Deployment</span>
        </button>
      </div>

      {/* Tab: Docker */}
      {activeTab === 'docker' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Dockerfile */}
            <div className="p-4 rounded-lg bg-[#161b22] border border-[#30363d] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#30363d]">
                <span className="text-xs font-mono text-[#f0f6fc]">
                  Dockerfile
                </span>
                <button
                  onClick={() => copyToClipboard(dockerfileContent, 'dockerfile')}
                  className="px-2 py-1 text-xs text-[#8b949e] hover:text-white bg-[#21262d] rounded flex items-center gap-1.5 transition-colors"
                >
                  {copiedKey === 'dockerfile' ? <Check className="w-3.5 h-3.5 text-[#3fb950]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'dockerfile' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <pre className="p-3 bg-[#0d1117] border border-[#30363d] rounded text-xs font-mono text-[#c9d1d9] overflow-x-auto leading-relaxed">
                {dockerfileContent}
              </pre>

              <div className="text-xs text-[#8b949e] space-y-1 leading-relaxed">
                <p>• <strong>Stage 1 (builder):</strong> Compiles React 19 SPA with Node 22 Alpine.</p>
                <p>• <strong>Stage 2 (runner):</strong> Serves static build via minimal Nginx Alpine (&lt;25MB).</p>
              </div>
            </div>

            {/* Docker Commands */}
            <div className="p-4 rounded-lg bg-[#161b22] border border-[#30363d] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#30363d]">
                <span className="text-xs font-mono text-[#f0f6fc]">
                  Execution Commands
                </span>
                <button
                  onClick={() => copyToClipboard(dockerCommands, 'dockercommands')}
                  className="px-2 py-1 text-xs text-[#8b949e] hover:text-white bg-[#21262d] rounded flex items-center gap-1.5 transition-colors"
                >
                  {copiedKey === 'dockercommands' ? <Check className="w-3.5 h-3.5 text-[#3fb950]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'dockercommands' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <pre className="p-3 bg-[#0d1117] border border-[#30363d] rounded text-xs font-mono text-[#c9d1d9] overflow-x-auto leading-relaxed">
                {dockerCommands}
              </pre>

              <div className="p-3 bg-[#0d1117] border border-[#30363d] rounded text-xs text-[#8b949e] space-y-1">
                <div className="text-[#f0f6fc] font-medium">Verification checklist:</div>
                <p>1. Ensure container responds with HTTP 200 at <code className="text-[#58a6ff]">http://localhost:8080/</code></p>
                <p>2. Verify single-page routing falls back cleanly to index.html</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: CI/CD */}
      {activeTab === 'cicd' && (
        <div className="space-y-6">
          <div className="p-4 rounded-lg bg-[#161b22] border border-[#30363d] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#30363d]">
              <div>
                <span className="text-xs font-mono text-[#f0f6fc] block">
                  .github/workflows/ci-cd.yml
                </span>
                <span className="text-[11px] text-[#8b949e]">
                  Triggers on push & pull request to branch main
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(cicdWorkflow, 'cicd')}
                className="px-2 py-1 text-xs text-[#8b949e] hover:text-white bg-[#21262d] rounded flex items-center gap-1.5 transition-colors"
              >
                {copiedKey === 'cicd' ? <Check className="w-3.5 h-3.5 text-[#3fb950]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'cicd' ? 'Copied' : 'Copy YAML'}</span>
              </button>
            </div>

            <pre className="p-3 bg-[#0d1117] border border-[#30363d] rounded text-xs font-mono text-[#c9d1d9] overflow-x-auto leading-relaxed">
              {cicdWorkflow}
            </pre>
          </div>
        </div>
      )}

      {/* Tab: GitHub */}
      {activeTab === 'github' && (
        <div className="space-y-6">
          <div className="p-4 rounded-lg bg-[#161b22] border border-[#30363d] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#30363d]">
              <div>
                <span className="text-xs font-semibold text-[#f0f6fc] block">
                  Publish to GitHub
                </span>
                <span className="text-[11px] font-mono text-[#8b949e]">
                  Repository: nexora-ai-devops-manager
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(gitCommands, 'git')}
                className="px-2 py-1 text-xs text-[#8b949e] hover:text-white bg-[#21262d] rounded flex items-center gap-1.5 transition-colors"
              >
                {copiedKey === 'git' ? <Check className="w-3.5 h-3.5 text-[#3fb950]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'git' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <pre className="p-3 bg-[#0d1117] border border-[#30363d] rounded text-xs font-mono text-[#c9d1d9] overflow-x-auto leading-relaxed">
              {gitCommands}
            </pre>
          </div>
        </div>
      )}

      {/* Tab: Cloud Deployment */}
      {activeTab === 'deploy' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-lg bg-[#161b22] border border-[#30363d] space-y-2 text-xs">
            <h3 className="font-semibold text-[#f0f6fc]">
              Vercel Deployment
            </h3>
            <p className="text-[#8b949e]">
              1. Import the <code className="text-[#58a6ff]">nexora-ai-devops-manager</code> repository in Vercel.
            </p>
            <p className="text-[#8b949e]">
              2. Framework Preset: Vite
            </p>
            <p className="text-[#8b949e]">
              3. Build Command: <code className="text-[#c9d1d9]">npm run build</code>
            </p>
            <p className="text-[#8b949e]">
              4. Output Directory: <code className="text-[#c9d1d9]">dist</code>
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#161b22] border border-[#30363d] space-y-2 text-xs">
            <h3 className="font-semibold text-[#f0f6fc]">
              Google Cloud Run Deployment
            </h3>
            <p className="text-[#8b949e]">
              1. Build container image via Cloud Build:
            </p>
            <pre className="p-2 bg-[#0d1117] rounded font-mono text-[11px] text-[#c9d1d9]">
              gcloud builds submit --tag gcr.io/$PROJECT_ID/nexora
            </pre>
            <p className="text-[#8b949e]">
              2. Deploy service on port 80 with unauthenticated access enabled.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
