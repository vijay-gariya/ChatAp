from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timezone
import os
import socket
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///chat.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# Track each connected socket's active room for presence updates.
active_socket_rooms = {}
active_socket_users = {}


def to_utc_iso(value):
    if value is None:
        return None
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc).isoformat().replace('+00:00', 'Z')

# Database Models
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    avatar = db.Column(db.String(200), default='https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=150')
    is_online = db.Column(db.Boolean, default=False)
    last_seen = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    messages = db.relationship('Message', backref='author', lazy=True)

class ChatRoom(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    is_private = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    messages = db.relationship('Message', backref='room', lazy=True)

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    room_id = db.Column(db.Integer, db.ForeignKey('chat_room.id'), nullable=False)
    message_type = db.Column(db.String(20), default='text')
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Routes
@app.route('/')
def index():
    if current_user.is_authenticated:
        return redirect(url_for('chat'))
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    room_id = request.args.get('room', type=int)

    if request.method == 'POST':
        data = request.get_json(silent=True) or {}
        email = data.get('email', '').strip()
        password = data.get('password', '')
        
        user = User.query.filter_by(email=email).first()
        
        if user and check_password_hash(user.password_hash, password):
            login_user(user)
            user.is_online = True
            db.session.commit()
            redirect_url = url_for('chat', room=room_id) if room_id else url_for('chat')
            return jsonify({'success': True, 'redirect': redirect_url})
        else:
            return jsonify({'success': False, 'error': 'Invalid credentials'})
    
    return render_template('login.html', room_id=room_id)

@app.route('/register', methods=['GET', 'POST'])
def register():
    room_id = request.args.get('room', type=int)

    if request.method == 'POST':
        data = request.get_json(silent=True) or {}
        username = data.get('username', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '')

        if len(password) < 6:
            return jsonify({'success': False, 'error': 'Password must be at least 6 characters'})
        
        if User.query.filter_by(email=email).first():
            return jsonify({'success': False, 'error': 'Email already exists'})
        
        if User.query.filter_by(username=username).first():
            return jsonify({'success': False, 'error': 'Username already exists'})
        
        user = User(
            username=username,
            email=email,
            password_hash=generate_password_hash(password)
        )
        
        db.session.add(user)
        db.session.commit()
        
        login_user(user)
        user.is_online = True
        db.session.commit()
        
        redirect_url = url_for('chat', room=room_id) if room_id else url_for('chat')
        return jsonify({'success': True, 'redirect': redirect_url})
    
    return render_template('register.html', room_id=room_id)


@app.route('/invite/<int:room_id>')
@app.route('/invitation/<int:room_id>')
@app.route('/invitetion/<int:room_id>')
@app.route('/join/<int:room_id>')
def invite(room_id):
    room = ChatRoom.query.get_or_404(room_id)
    if current_user.is_authenticated:
        return redirect(url_for('chat', room=room.id))
    return redirect(url_for('register', room=room.id))


@app.route('/invite')
@app.route('/invitation')
@app.route('/invitetion')
@app.route('/join')
def invite_with_query():
    room_id = request.args.get('room', type=int)
    if not room_id:
        return redirect(url_for('chat') if current_user.is_authenticated else url_for('login'))
    return redirect(url_for('invite', room_id=room_id))

@app.route('/chat')
@login_required
def chat():
    rooms = ChatRoom.query.all()
    selected_room_id = request.args.get('room', type=int)
    if selected_room_id and not ChatRoom.query.get(selected_room_id):
        selected_room_id = None

    public_base_url = os.getenv('PUBLIC_BASE_URL', '').strip()
    if not public_base_url:
        public_base_url = request.host_url.rstrip('/')
        host = request.host.split(':')[0]
        if host in ('127.0.0.1', 'localhost', '::1'):
            try:
                temp_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
                temp_sock.connect(('8.8.8.8', 80))
                local_ip = temp_sock.getsockname()[0]
                temp_sock.close()

                # Keep the current port if one is present in request.host.
                if ':' in request.host:
                    port = request.host.split(':', 1)[1]
                    public_base_url = f'http://{local_ip}:{port}'
                else:
                    public_base_url = f'http://{local_ip}'
            except OSError:
                # Fallback to host_url when local IP detection fails.
                public_base_url = request.host_url.rstrip('/')

    return render_template(
        'chat.html',
        user=current_user,
        rooms=rooms,
        selected_room_id=selected_room_id,
        public_base_url=public_base_url
    )

@app.route('/logout')
@login_required
def logout():
    current_user.is_online = False
    current_user.last_seen = datetime.utcnow()
    db.session.commit()
    logout_user()
    return redirect(url_for('login'))

@app.route('/api/messages/<int:room_id>')
@login_required
def get_messages(room_id):
    messages = Message.query.filter_by(room_id=room_id).order_by(Message.timestamp.asc()).all()
    return jsonify([{
        'id': msg.id,
        'content': msg.content,
        'username': msg.author.username,
        'userId': msg.user_id,
        'timestamp': to_utc_iso(msg.timestamp),
        'type': msg.message_type
    } for msg in messages])


@app.route('/api/rooms/<int:room_id>/members')
@login_required
def get_room_members(room_id):
    ChatRoom.query.get_or_404(room_id)

    active_user_ids = {
        user_id
        for sid, user_id in active_socket_users.items()
        if active_socket_rooms.get(sid) == room_id
    }
    message_user_ids = {
        user_id for (user_id,) in db.session.query(Message.user_id).filter_by(room_id=room_id).distinct().all()
    }
    member_ids = active_user_ids | message_user_ids | {current_user.id}

    members = []
    if member_ids:
        users = User.query.filter(User.id.in_(member_ids)).order_by(User.username.asc()).all()
        members = [{
            'id': user.id,
            'username': user.username,
            'avatar': user.avatar,
            'isOnline': user.is_online,
            'inRoom': user.id in active_user_ids,
            'lastSeen': to_utc_iso(user.last_seen)
        } for user in users]

    return jsonify({'members': members})

# Socket.IO Events
@socketio.on('connect')
@login_required
def on_connect():
    active_socket_users[request.sid] = current_user.id
    current_user.is_online = True
    db.session.commit()
    emit('user_connected', {'username': current_user.username}, broadcast=True)

@socketio.on('disconnect')
@login_required
def on_disconnect():
    room_id = active_socket_rooms.pop(request.sid, None)
    active_socket_users.pop(request.sid, None)

    current_user.is_online = False
    current_user.last_seen = datetime.utcnow()
    db.session.commit()

    if room_id:
        emit('user_presence', {
            'type': 'left',
            'username': current_user.username,
            'room_id': room_id,
            'timestamp': to_utc_iso(datetime.utcnow())
        }, room=str(room_id))

    emit('user_disconnected', {'username': current_user.username}, broadcast=True)

@socketio.on('join_room')
@login_required
def on_join_room(data):
    room_id = int(data['room_id'])
    room = ChatRoom.query.get(room_id)
    if not room:
        emit('room_error', {'error': 'Room not found'})
        return

    previous_room = active_socket_rooms.get(request.sid)
    if previous_room and previous_room != room_id:
        leave_room(str(previous_room))
        emit('user_presence', {
            'type': 'left',
            'username': current_user.username,
            'room_id': previous_room,
            'timestamp': to_utc_iso(datetime.utcnow())
        }, room=str(previous_room))

    join_room(str(room_id))
    active_socket_rooms[request.sid] = room_id

    emit('joined_room', {'room_id': room_id, 'room_name': room.name})
    emit('user_presence', {
        'type': 'joined',
        'username': current_user.username,
        'room_id': room_id,
        'timestamp': to_utc_iso(datetime.utcnow())
    }, room=str(room_id), include_self=False)

@socketio.on('leave_room')
@login_required
def on_leave_room(data):
    room_id = int(data['room_id'])
    leave_room(str(room_id))

    if active_socket_rooms.get(request.sid) == room_id:
        active_socket_rooms.pop(request.sid, None)

    emit('user_presence', {
        'type': 'left',
        'username': current_user.username,
        'room_id': room_id,
        'timestamp': to_utc_iso(datetime.utcnow())
    }, room=str(room_id), include_self=False)

@socketio.on('send_message')
@login_required
def on_send_message(data):
    room_id = data['room_id']
    content = data['content']
    
    message = Message(
        content=content,
        user_id=current_user.id,
        room_id=room_id
    )
    
    db.session.add(message)
    db.session.commit()
    
    emit('new_message', {
        'id': message.id,
        'content': message.content,
        'username': current_user.username,
        'userId': current_user.id,
        'timestamp': to_utc_iso(message.timestamp),
        'type': message.message_type
    }, room=str(room_id))

@socketio.on('typing')
@login_required
def on_typing(data):
    room_id = data['room_id']
    emit('user_typing', {
        'username': current_user.username,
        'userId': current_user.id
    }, room=str(room_id), include_self=False)

def init_db():
    with app.app_context():
        db.create_all()
        
        # Create default rooms if they don't exist
        if not ChatRoom.query.first():
            rooms = [
                ChatRoom(name='General', description='General discussion for everyone'),
                ChatRoom(name='Random', description='Random conversations and fun'),
                ChatRoom(name='Tech Talk', description='Discuss technology and programming')
            ]
            
            for room in rooms:
                db.session.add(room)
            
            # Create demo user
            demo_user = User(
                username='john_doe',
                email='john@example.com',
                password_hash=generate_password_hash('password'),
                avatar='https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'
            )
            db.session.add(demo_user)
            db.session.commit()
            
            # Add demo messages
            demo_messages = [
                Message(content='Hey everyone! Welcome to the chat!', user_id=demo_user.id, room_id=1),
                Message(content='This chat app looks amazing!', user_id=demo_user.id, room_id=1)
            ]
            
            for msg in demo_messages:
                db.session.add(msg)
            
            db.session.commit()

if __name__ == '__main__':
    init_db()
    socketio.run(app, debug=True, host='0.0.0.0', port=5000, allow_unsafe_werkzeug=True)