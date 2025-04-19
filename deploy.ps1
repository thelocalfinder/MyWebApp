# Azure deployment script
param(
    [string]$ResourceGroupName = "your-resource-group",
    [string]$AppName = "your-app-name",
    [string]$Location = "eastus"
)

# Login to Azure (if not already logged in)
az login

# Create resource group if it doesn't exist
az group create --name $ResourceGroupName --location $Location

# Create App Service plan
az appservice plan create --name "${AppName}-plan" --resource-group $ResourceGroupName --sku B1 --is-linux

# Create web app
az webapp create --name $AppName --resource-group $ResourceGroupName --plan "${AppName}-plan" --runtime "DOTNETCORE:7.0"

# Configure app settings
az webapp config appsettings set --name $AppName --resource-group $ResourceGroupName --settings @'
{
    "MYSQL_SERVER": "your-mysql-server",
    "MYSQL_DATABASE": "your-database",
    "MYSQL_USER": "your-user",
    "MYSQL_PASSWORD": "your-password",
    "JWT_KEY": "your-jwt-key",
    "JWT_ISSUER": "your-app-name.azurewebsites.net",
    "JWT_AUDIENCE": "your-app-name.azurewebsites.net",
    "FRONTEND_URL": "https://your-frontend-url",
    "SMTP_SERVER": "your-smtp-server",
    "SMTP_PORT": "587",
    "SMTP_USERNAME": "your-smtp-username",
    "SMTP_PASSWORD": "your-smtp-password",
    "SMTP_FROM": "your-email@domain.com"
}
'@

# Deploy the application
dotnet publish backend/backend.csproj -c Release -o ./publish
Compress-Archive -Path ./publish/* -DestinationPath ./publish.zip -Force
az webapp deployment source config-zip --resource-group $ResourceGroupName --name $AppName --src ./publish.zip

Write-Host "Deployment completed! Your app is available at: https://$AppName.azurewebsites.net" 