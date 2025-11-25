# Daily Messenger

Daily Messenger is a Node.js application that manages user subscriptions and sends automated daily emails using a scheduler.

## Features

- **User Subscription**: Users can subscribe to receive daily messages.
- **Unsubscription**: Users can opt-out at any time.
- **Automated Scheduling**: Sends emails daily at a configured time (default 09:00 AM).
- **Asynchronous Database**: Uses SQLite with Promise-based operations for reliability.
- **Input Validation**: Ensures valid names and emails are registered.

## Technologies

- **Node.js** (v14+)
- **Express**: Web server for API endpoints.
- **SQLite3**: Lightweight database for storing users and logs.
- **Nodemailer**: For sending emails via SMTP.
- **Node-cron**: For scheduling recurring tasks.

## Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/moisesz10/daily-messenger.git
    cd daily-messenger
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment**:
    Create a `.env` file in the root directory (copy from `.env.example`):
    ```bash
    cp .env.example .env
    ```
    Update the `.env` file with your SMTP credentials:
    ```env
    PORT=3000
    SMTP_HOST=smtp.example.com
    SMTP_PORT=587
    SMTP_USER=your_email@example.com
    SMTP_PASS=your_password
    EMAIL_FROM=noreply@example.com
    DAILY_CRON="0 9 * * *"
    ```

## Usage

1.  **Start the server**:
    ```bash
    npm start
    ```
    For development (with auto-reload):
    ```bash
    npm run dev
    ```

2.  **API Endpoints**:

    -   **Subscribe a user**:
        ```bash
        POST /subscribe
        Content-Type: application/json
        {
            "name": "User Name",
            "email": "user@example.com"
        }
        ```

    -   **Unsubscribe a user**:
        ```bash
        POST /unsubscribe
        Content-Type: application/json
        {
            "email": "user@example.com"
        }
        ```

    -   **List active users**:
        ```bash
        GET /users
        ```

## Project Structure

-   `src/index.js`: Main entry point.
-   `src/db/db.js`: Database connection and operations.
-   `src/scheduler/scheduler.js`: Cron job configuration.
-   `src/services/dailyMessage.js`: Logic for generating message content.
-   `src/mail/mailer.js`: Email sending utility.
-   `src/middleware/validation.js`: Request validation middleware.
