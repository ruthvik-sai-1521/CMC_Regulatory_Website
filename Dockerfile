FROM node:20-slim AS build

WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN cd frontend && npm ci
COPY frontend ./frontend

# VITE_API_BASE_URL must be configured as a Railway build variable.
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN test -n "$VITE_API_BASE_URL" || (echo "ERROR: VITE_API_BASE_URL is required for the Railway frontend service" && exit 1)
RUN cd frontend && npm run build

FROM node:20-slim
WORKDIR /app
RUN npm install --global serve@14
COPY --from=build /app/frontend/dist ./dist
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

ENV PORT=4173
EXPOSE 4173
CMD ["sh", "-c", "printf 'window.__RAUZR_API_BASE_URL__=%s;' \"$(node -e 'process.stdout.write(JSON.stringify(process.env.VITE_API_BASE_URL || \"\"))')\" > dist/runtime-config.js && serve -s dist -l ${PORT}"]
