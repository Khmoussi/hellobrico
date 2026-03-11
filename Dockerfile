# --- Builder stage ---
    FROM node:lts AS builder
    WORKDIR /usr/src/app
    
    # Copy package files
    COPY package*.json ./
    
    # Install dependencies (dev + prod)
    RUN npm install
    
    # Copy all source code
    COPY . .
    
    # Build production
    RUN npm run build:prod
    
    # --- Production stage ---
    FROM node:lts
    WORKDIR /usr/src/app
    
    # Set production environment
    ENV NODE_ENV=production
    ARG PORT=3000
    EXPOSE $PORT
    
    # Copy build output and node_modules
    COPY --from=builder /usr/src/app/dist ./dist
    COPY --from=builder /usr/src/app/node_modules ./node_modules
    COPY package*.json ./
    
    # Start the app
    CMD ["node", "dist/main.js"]