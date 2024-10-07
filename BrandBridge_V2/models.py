from flask_sqlalchemy import SQLAlchemy
from flask_security import RoleMixin, UserMixin
from datetime import datetime
from pytz import timezone
import uuid

db = SQLAlchemy()

roles_users = db.Table('roles_users',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id')),
    db.Column('role_id', db.Integer, db.ForeignKey('role.id'))
)

class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True)
    description = db.Column(db.String(255))

class User(db.Model, UserMixin):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(60), nullable=False)
    active = db.Column(db.Boolean, nullable=False, default=True)
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    roles = db.relationship('Role', secondary=roles_users, backref=db.backref('users', lazy='dynamic'))
    type = db.Column(db.String(50))  # polymorphic identity column

    __mapper_args__ = {
        'polymorphic_on': type,
        'polymorphic_identity': 'user',
        'with_polymorphic': '*'
    }

    def is_admin(self):
        return 'admin' in [role.name for role in self.roles]

    def is_sponsor(self):
        return 'sponsor' in [role.name for role in self.roles]

    def is_influencer(self):
        return 'influencer' in [role.name for role in self.roles]

class Sponsor(User):
    __tablename__ = 'sponsor'
    id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    company_name = db.Column(db.String(40), unique=True, nullable=False)
    industry = db.Column(db.String(40), nullable=False)
    budget = db.Column(db.Integer, nullable=False)
    image_file = db.Column(db.String(20), nullable=False, default='default_company.png')
    campaigns = db.relationship('Campaign', backref='owner', lazy=True)

    __mapper_args__ = {
        'polymorphic_identity': 'sponsor',
    }

    def __repr__(self):
        return f"Sponsor('{self.company_name}', '{self.industry}', '{self.image_file}')"

class Influencer(User):
    __tablename__ = 'influencer'
    id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    name = db.Column(db.String(40), nullable=False)
    niche = db.Column(db.String(40), nullable=False)
    reach = db.Column(db.Integer, nullable=False)  # e.g., number of followers
    image_file = db.Column(db.String(20), nullable=False, default='default_influencer.jpg')
    total_earnings = db.Column(db.Integer, default=0)
    ad_requests = db.relationship('AdRequest', backref='influencer', lazy=True)

    __mapper_args__ = {
        'polymorphic_identity': 'influencer',
    }

    def __repr__(self):
        return f"Influencer('{self.name}', '{self.category}', '{self.niche}', '{self.reach}', '{self.image_file}')"

class Campaign(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    desc = db.Column(db.Text, nullable=False)
    date_posted = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone("Asia/Kolkata")))
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)
    budget = db.Column(db.Integer, nullable=False)
    goals = db.Column(db.Text, nullable=False)
    sponsor_id = db.Column(db.Integer, db.ForeignKey('sponsor.id'), nullable=False)
    ad_requests = db.relationship('AdRequest', backref='campaign', lazy=True)

    def __repr__(self):
        return f"Campaign('{self.title}', '{self.date_posted}', '{self.start_date}', '{self.end_date}', '{self.goals}')"

class AdRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaign.id'), nullable=False)
    influencer_id = db.Column(db.Integer, db.ForeignKey('influencer.id'), nullable=False)
    messages = db.Column(db.Text, nullable=True)
    requirements = db.Column(db.Text, nullable=False)
    payment_amount = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(10), nullable=False, default='Pending')  # 'Pending', 'Accepted', 'Rejected'

    def __repr__(self):
        return f"AdRequest('{self.campaign_id}', '{self.influencer_id}', '{self.status}', '{self.payment_amount}')"
