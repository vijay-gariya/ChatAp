# Real-time Chat Application

A beautiful, production-ready real-time chat application built with Flask, Socket.IO, and modern web technologies.

## 🚀 Features

- **Real-time messaging** with Socket.IO
- **User authentication** (login/register)
- **Multiple chat rooms**
- **Typing indicators**
- **Online status tracking**
- **Responsive design** (mobile-friendly)
- **Beautiful UI** with Tailwind CSS
- **SQLite database** (easily switchable to PostgreSQL/MySQL)

## 📁 Project Structure

```
chat-app/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── .env                  # Environment variables
├── README.md             # This file
└── templates/            # HTML templates
    ├── base.html         # Base template with CSS/JS
    ├── login.html        # Login page
    ├── register.html     # Registration page
    └── chat.html         # Main chat interface
```

## 🛠️ Installation & Setup

### Prerequisites
- Python 3.7+
- pip (Python package manager)

### Step 1: Clone/Download the Project
```bash
# If using git
git clone <your-repo-url>
cd chat-app

# Or download and extract the ZIP file
```

### Step 2: Create Virtual Environment (Recommended)
```bash
# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Run the Application
```bash
python app.py
```

### Step 5: Access the Chat App
Open your browser and go to: `http://localhost:5000`

## 🎯 Demo Credentials

**Email:** `john@example.com`  
**Password:** `password`

## 🎨 Features Overview

### Authentication
- Secure user registration and login
- Password hashing with Werkzeug
- Session management with Flask-Login

### Real-time Chat
- Instant message delivery
- Multiple chat rooms (General, Random, Tech Talk)
- Typing indicators
- Online/offline status

### Modern UI/UX
- Gradient backgrounds and glass effects
- Smooth animations and hover effects
- Mobile-responsive design
- Custom scrollbars and micro-interactions

## 🔧 Configuration

### Environment Variables (.env)
```env
SECRET_KEY=your-super-secret-key-change-this-in-production
DATABASE_URL=sqlite:///chat.db
FLASK_ENV=development
FLASK_DEBUG=True
```

### Database
The app uses SQLite by default. To switch to PostgreSQL or MySQL:

1. Update `DATABASE_URL` in `.env`
2. Install the appropriate database driver:
   ```bash
   # For PostgreSQL
   pip install psycopg2-binary
   
   # For MySQL
   pip install PyMySQL
   ```

## 🚀 Deployment

### For Production:
1. Set `FLASK_ENV=production` in `.env`
2. Use a production WSGI server like Gunicorn:
   ```bash
   pip install gunicorn
   gunicorn -k eventlet -w 1 app:app
   ```
3. Use a reverse proxy (Nginx) for static files
4. Use a production database (PostgreSQL/MySQL)

## 🛠️ Development

### Adding New Features
- **New routes:** Add to `app.py`
- **New templates:** Create in `templates/`
- **Database changes:** Modify models in `app.py`
- **Real-time features:** Add Socket.IO events

### File Organization
- `app.py` - Main application logic
- `templates/base.html` - Shared CSS/JS and layout
- `templates/login.html` - Login page
- `templates/register.html` - Registration page
- `templates/chat.html` - Main chat interface

## 📱 Mobile Support

The application is fully responsive and works great on:
- Desktop computers
- Tablets
- Mobile phones
- All modern browsers

## 🌐 Public Invite Links

If you want someone to join from outside your Wi-Fi network, you need a public URL. A local address like `http://127.0.0.1:5000` will only work on your own machine.

### Option 1: Use your LAN IP
If the other person is on the same Wi-Fi, start the app and share the IP address shown in the Flask console, for example:
```text
http://172.20.10.3:5000
```

### Option 2: Use ngrok for public access
1. Start the app:
```bash
python app.py
```

2. In another terminal, expose port 5000 with ngrok:
```bash
ngrok http 5000
```

3. ngrok will give you a public HTTPS URL like:
```text
https://abcd-1234.ngrok-free.app
```

4. Set `PUBLIC_BASE_URL` to that URL in your `.env` file so invite links use the public address:
```env
PUBLIC_BASE_URL=https://abcd-1234.ngrok-free.app
```

5. Restart the Flask app and share the invite link from the chat room.

### Notes
- The invite link must be opened from the same public URL that your app is using.
- If `PUBLIC_BASE_URL` is not set, the app falls back to the current browser origin.
- For people outside your network, ngrok or another tunnel is required.

## 🎨 Customization

### Colors & Themes
Edit the CSS in `templates/base.html` to customize:
- Color schemes
- Gradients
- Animations
- Layout

### Chat Rooms
Modify the `init_db()` function in `app.py` to add/remove default rooms.

## 🐛 Troubleshooting

### Common Issues:

1. **Port 5000 already in use:**
   ```python
   # Change port in app.py
   socketio.run(app, debug=True, host='0.0.0.0', port=5001)
   ```

2. **Database errors:**
   ```bash
   # Delete database and restart
   rm chat.db
   python app.py
   ```

3. **Module not found:**
   ```bash
   # Reinstall dependencies
   pip install -r requirements.txt
   ```

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to fork this project and submit pull requests for any improvements!

---

**Enjoy your new chat application! 🎉**