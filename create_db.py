from run import app
from BrandBridge_V2.sec import datastore
from BrandBridge_V2.models import db
from werkzeug.security import generate_password_hash
with app.app_context():
    db.create_all()
    
    # Ensure roles are created
    admin_role = datastore.find_or_create_role(name="admin", description="User is an Admin")
    sponsor_role = datastore.find_or_create_role(name="sponsor", description="User is a Sponsor")
    influencer_role = datastore.find_or_create_role(name="influencer", description="User is an Influencer")

    # Create users with roles
    if not datastore.find_user(email='admin@gmail.com'):
        datastore.create_user(email='admin@gmail.com', password=generate_password_hash('admin'), roles=[admin_role])

    if not datastore.find_user(email='defaultsponsor@gmail.com'):
        datastore.create_user(email='defaultsponsor@gmail.com', password=generate_password_hash('defaultsponsor'), roles=[sponsor_role])

    if not datastore.find_user(email='defaultinfluencer@gmail.com'):
        datastore.create_user(email='defaultinfluencer@gmail.com', password=generate_password_hash('defaultinfluencer'), roles=[influencer_role])

    db.session.commit()
