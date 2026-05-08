FROM node:20-slim

WORKDIR /app

# Install system dependencies for LiveKit and Python (for some AI libs)
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the project
RUN npx tsc

# Set production environment
ENV NODE_ENV=production

# Start the agent worker
CMD ["npx", "tsx", "agent/index.ts", "start"]
