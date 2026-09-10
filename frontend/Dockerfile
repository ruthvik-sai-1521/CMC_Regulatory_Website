# --- build stage ---
FROM node:20-slim AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
# VITE_API_BASE_URL must be provided as a Railway "Build" variable (not
# just a runtime variable) since Vite inlines it at build time.
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN test -n "$VITE_API_BASE_URL" || (echo "ERROR: VITE_API_BASE_URL is required for the Railway frontend service" && exit 1)
RUN npm run build

# --- serve stage ---
FROM node:20-slim
WORKDIR /app
RUN npm install -g serve@14
COPY --from=build /app/dist ./dist
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV PORT=4173
EXPOSE 4173
CMD ["sh", "-c", "printf 'window.__RAUZR_API_BASE_URL__=%s;' \"$(node -e 'process.stdout.write(JSON.stringify(process.env.VITE_API_BASE_URL || \"\"))')\" > dist/runtime-config.js && serve -s dist -l ${PORT}"]
