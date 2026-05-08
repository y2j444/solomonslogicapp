FROM node:20

WORKDIR /app

# Install system dependencies
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

# Build and Bundle the Agent for Production
RUN node build-agent.mjs

# Set production environment
ENV NODE_ENV=production

# Start the agent worker using the bundled code
CMD ["node", "dist/agent/index.js", "start"]
