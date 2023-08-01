# Project Documentation

## Overview
This project is a NestJS server that provides a flexible and configurable interface to a MongoDB database. The interface is defined by YAML configuration files, which can be changed and expanded to suit the needs of the application. In addition to the main server, there is a separate command-line interface (CLI) tool that manages and applies database migrations.

## Main Application
The main application is a NestJS server responsible for serving requests to clients. It interprets the YAML configuration files at startup to generate Mongoose schemas, which serve as the database interface. When a client makes a request, the server uses this database interface to interact with the database.
More [here](./docs/Server.md).

## Migration CLI Tool
The CLI tool is responsible for managing and applying database migrations. It works by detecting changes between different versions of the YAML configuration files and applying the necessary transformations to the database. This tool ensures that the database state matches the current YAML configuration.
More [here](./docs/CLITool.md).

## Schema Versioning
To track the current state of the database, a "schema version" field is maintained in the database. This field reflects the version of the YAML configuration that the database currently aligns with. The CLI tool updates this field whenever it applies a migration, and the server reads this field at startup to determine how to interpret the YAML files and generate the database interface.
More [here](./docs/Schema.md).

## Security Considerations
This system is designed for use by developers and includes minimal security measures. It is recommended to use it in conjunction with an external authentication and authorization server for production environments.

## Future Developments
Plans for future development include enhancing security measures and adding support for more complex database operations.

## Getting Started
To get started with this project, follow these steps...
- install pnpm
- ...

And so on. Please expand on this as necessary, and be sure to include detailed instructions for setting up the project and using the server and CLI tool.