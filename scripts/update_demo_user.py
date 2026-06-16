import sys
import os
proj_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if proj_root not in sys.path:
    sys.path.insert(0, proj_root)

from app import app, db, User

with app.app_context():
    # Update any existing demo user email john@example.com to vjysingh@example.com
    old_email = 'john@example.com'
    new_email = 'vjysingh@example.com'
    user = User.query.filter_by(email=old_email).first()
    if user:
        print(f'Found user with email {old_email}, updating...')
        user.email = new_email
        user.username = 'VjySingh'
        user.avatar = '/static/images/vijay.jpg'
        if not user.password_hash:
            from werkzeug.security import generate_password_hash
            user.password_hash = generate_password_hash('password')
        db.session.commit()
        print('Updated existing demo user.')
    else:
        print('No user with email john@example.com found. Creating/updating user by new email...')
        user = User.query.filter_by(email=new_email).first()
        if user:
            user.username = 'VjySingh'
            user.avatar = '/static/images/vijay.jpg'
            db.session.commit()
            print('Updated existing user with new email.')
        else:
            from werkzeug.security import generate_password_hash
            user = User(username='VjySingh', email=new_email, password_hash=generate_password_hash('password'), avatar='/static/images/vijay.jpg')
            db.session.add(user)
            db.session.commit()
            print('Created demo user vjysingh@example.com')
