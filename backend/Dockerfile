# Build stage for Go backend
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Copy dependency definitions
COPY go.mod ./
# Download dependencies (uncomment when dependencies are added)
# RUN go mod download

# Copy backend source code
COPY . .

# Build binary
RUN CGO_ENABLED=0 GOOS=linux go build -o /server ./cmd/server

# Run stage
FROM alpine:latest

WORKDIR /

COPY --from=builder /server /server

EXPOSE 8080

CMD ["/server"]
