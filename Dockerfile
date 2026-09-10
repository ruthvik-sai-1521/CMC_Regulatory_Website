FROM node:20-slim AS build

WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN cd frontend && npm ci
COPY frontend ./frontend

# VITE_API_BASE_URL must be configured as a Railway build variable.
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN cd frontend && npm run build

FROM node:20-slim
WORKDIR /app
RUN npm install --global serve@14
COPY --from=build /app/frontend/dist ./dist

ENV PORT=4173
EXPOSE 4173
CMD ["sh", "-c", "serve -s dist -l ${PORT}"]
