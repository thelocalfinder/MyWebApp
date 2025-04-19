#!/bin/bash

# Create the directory if it doesn't exist
mkdir -p /etc/ssl/certs

# Download the DigiCert Global Root CA certificate
curl -o /etc/ssl/certs/DigiCertGlobalRootCA.crt.pem https://dl.cacerts.digicert.com/DigiCertGlobalRootCA.crt.pem

# Set proper permissions
chmod 644 /etc/ssl/certs/DigiCertGlobalRootCA.crt.pem 