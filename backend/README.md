# Telegram Profile Parser - Deployment Guide

This guide provides step-by-step instructions to deploy the bot (backend) and the admin panel (frontend) on an Ubuntu server. The previous instructions were flawed; this new process is simpler and more reliable.

---

### **Overview of the New Process**

The entire project (frontend and backend) is now managed by a single `package.json` file in the root directory. A single `npm run build` command will:
1.  Compile the frontend React application into simple HTML and JavaScript.
2.  Compile the backend TypeScript code into JavaScript.
All compiled files will be placed in a `dist` directory, ready for deployment.

---

### **Part 1: Server Preparation**

_If you have already done this from the previous guide (installed Node.js, PostgreSQL, PM2, Git, Nginx), you can skip to Part 2._

1.  **Connect to your server:**
    ```bash
    ssh root@YOUR_SERVER_IP
    ```
2.  **Update system:**
    ```bash
    apt update && apt upgrade -y
    ```
3.  **Install Node.js (v20):**
    ```bash
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
    # IMPORTANT: Log out and log back in to the server
    exit
    ssh root@YOUR_SERVER_IP
    # Now install and use Node.js
    nvm install 20
    nvm use 20
    ```
4.  **Install PostgreSQL, Git, Nginx, and PM2:**
    ```bash
    apt install postgresql postgresql-contrib git nginx -y
    npm install pm2 -g
    ```

### **Part 2: Database Setup**

_If you already have a database and user set up, you can skip this part. Just make sure you have your `DATABASE_URL` string ready._

1.  **Enter PostgreSQL shell:**
    ```bash
    sudo -u postgres psql
    ```
2.  **Create user and database (replace `my_secure_password` with a strong password):**
    ```sql
    CREATE USER bot_user WITH PASSWORD 'my_secure_password';
    CREATE DATABASE bot_db;
    GRANT ALL PRIVILEGES ON DATABASE bot_db TO bot_user;
    \q
    ```
3.  **Your connection string (`DATABASE_URL`) is:**
    `postgres://bot_user:my_secure_password@localhost:5432/bot_db`

### **Part 3: Code Deployment and Build**

1.  **Clone your project from GitHub:**
    (If you have it cloned already, just `cd` into the directory and run `git pull` to get the latest changes.)
    ```bash
    # Go to home directory
    cd ~
    # Clone your repository
    git clone https://github.com/YOUR_USERNAME/telegram-profile-bot.git
    # Enter the project directory
    cd telegram-profile-bot
    ```
2.  **DELETE the old package.json:** The project now uses the one in the root.
    ```bash
    rm backend/package.json
    ```
3.  **Install all dependencies:**
    ```bash
    npm install
    ```
4.  **Configure Environment Variables:**
    *   Navigate into the `backend` directory: `cd backend`
    *   Copy the example file to a new `.env` file: `cp .env.example .env`
    *   Edit the `.env` file: `nano .env`
    *   Fill in your `TELEGRAM_BOT_TOKEN`, `API_KEY`, and `DATABASE_URL`.
    *   Save (`Ctrl+X`), confirm (`Y`), and press `Enter`.
    *   Go back to the root project directory: `cd ..`
5.  **Build the entire application:**
    This single command compiles both frontend and backend.
    ```bash
    npm run build
    ```
    After this, you will have a `dist` folder in your project root containing a `public` subfolder for the frontend and a `backend` subfolder.

### **Part 4: Run the Backend with PM2**

1.  **Start the bot:**
    (If you have an old "telegram-bot" process running, delete it first with `pm2 delete telegram-bot`)
    ```bash
    pm2 start npm --name "telegram-bot" -- start
    ```
2.  **Save the process list and configure auto-startup:**
    ```bash
    pm2 save
    pm2 startup
    # Copy and run the command that pm2 gives you
    ```
3.  **Check status:**
    `pm2 status` (should show "telegram-bot" as online)

### **Part 5: Configure Nginx to Serve the Frontend**

1.  **Create a web directory and copy built files:**
    ```bash
    # Create the directory
    mkdir -p /var/www/admin-panel
    # Copy the built frontend files into it
    cp -r dist/public/* /var/www/admin-panel/
    ```
2.  **Configure Nginx:**
    *   Create a new Nginx config file: `nano /etc/nginx/sites-available/admin-panel`
    *   Paste the following configuration. **It's important that you replace `YOUR_SERVER_IP` with your actual server IP address.**
        ```nginx
        server {
            listen 80;
            server_name YOUR_SERVER_IP;

            root /var/www/admin-panel;
            index index.html;

            location / {
                try_files $uri /index.html;
            }

            # This part forwards API requests to your backend
            location /api {
                proxy_pass http://localhost:3001;
                proxy_http_version 1.1;
                proxy_set_header Upgrade $http_upgrade;
                proxy_set_header Connection 'upgrade';
                proxy_set_header Host $host;
                proxy_cache_bypass $http_upgrade;
            }
        }
        ```
    *   Enable the site and restart Nginx:
        ```bash
        ln -s /etc/nginx/sites-available/admin-panel /etc/nginx/sites-enabled/
        # (If you get an error that the file exists, you can remove the old default config: rm /etc/nginx/sites-enabled/default)
        nginx -t # Should say syntax is ok
        systemctl restart nginx
        ```
3.  **Configure Firewall (if not already done):**
    ```bash
    ufw allow 'Nginx Full'
    ufw allow 3001/tcp  # For the API
    ufw allow ssh
    ufw enable
    ```

### **Congratulations!**

Your bot should be running and your admin panel should be accessible at `http://YOUR_SERVER_IP`.

### **How to Update Your Application**

The process is now much simpler:
1.  Make code changes on your local machine.
2.  Push changes to GitHub: `git add . && git commit -m "My update" && git push`
3.  On your server:
    ```bash
    cd ~/telegram-profile-bot
    git pull
    npm install  # In case dependencies changed
    npm run build
    # Recopy only the frontend files that changed
    cp -r dist/public/* /var/www/admin-panel/
    # Restart the backend
    pm2 restart telegram-bot
    ```
