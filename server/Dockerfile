FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy project files
COPY . ./

# Restore and build
RUN dotnet restore ./API/API.csproj
RUN dotnet publish ./API/API.csproj -c Release -o /publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /publish .

EXPOSE 5000
CMD ["dotnet", "API.dll"]
