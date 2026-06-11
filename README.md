# Coworking Reservation System

This project is an ASP.NET Core Web API for managing a coworking reservation system.

The system will support functionality related to users, spaces, reservations, payments, availability, memberships, and schedules.

## Project Structure

The solution is organized inside the src folder.

Current structure:

* CoworkingReservation: Main solution.
* CoworkingReservation.API: ASP.NET Core Web API project.
* Controllers: Folder for API controllers.
* appsettings.json: Main application configuration file.
* appsettings.Development.json: Development environment configuration file.
* Program.cs: Application startup and service configuration.

## Development Branch

Development work must be performed using the develop branch as the base branch.

Feature branches should be created from develop and should follow the related issue being worked on.

Example:

* feature/1-initialize-api

## Running the API Locally

To run the API locally:

* Open the solution in Visual Studio.
* Select the HTTPS launch profile.
* Run the project.
* Open Swagger using the local HTTPS URL.

Example:

* https://localhost:7289/swagger

The port may change depending on the local development environment.

## Swagger

Swagger is configured for local API testing and documentation during development.

At this stage, no business endpoints are defined yet because the default template endpoint was removed to keep the project clean.

## Current Status

The initial ASP.NET Core Web API project has been created, configured, and prepared for future development.
