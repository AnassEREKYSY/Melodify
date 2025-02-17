# Use the .NET SDK image for building the application
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files and restore dependencies
COPY ["API/API.csproj", "API/"]
COPY ["Infrastructure/Infrastructure.csproj", "Infrastructure/"]
COPY ["Core/Core.csproj", "Core/"]
RUN dotnet restore "API/API.csproj"

# Copy the remaining source code
COPY . .

# Expose port 5000 for development access
EXPOSE 5000

# Start the application using dotnet run (development)
CMD ["dotnet", "run", "--project", "API/API.csproj"]
