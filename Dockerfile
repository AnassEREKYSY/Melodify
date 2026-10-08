# Melodify: one container serves the Angular app and the .NET API on port 5001.

# 1. Angular app
FROM node:20-alpine AS client
WORKDIR /src/client
COPY client/package.json client/package-lock.json ./
RUN npm ci --ignore-scripts
COPY client/ ./
RUN npx ng build --configuration production

# 2. .NET API (no NuGet packages: restores from the shared framework only)
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS server
WORKDIR /src
COPY server/Melodify.Api/Melodify.Api.csproj Melodify.Api/
RUN dotnet restore Melodify.Api/Melodify.Api.csproj
COPY server/Melodify.Api/ Melodify.Api/
RUN dotnet publish Melodify.Api/Melodify.Api.csproj -c Release -o /app --no-restore /p:UseAppHost=false

# 3. Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
ENV ASPNETCORE_ENVIRONMENT=Production \
    PORT=5001 \
    DOTNET_gcServer=0
COPY --from=server /app ./
COPY --from=client /src/client/dist/client/browser ./wwwroot
USER app
EXPOSE 5001
ENTRYPOINT ["dotnet", "Melodify.Api.dll"]
