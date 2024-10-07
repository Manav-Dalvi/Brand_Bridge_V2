from flask import Flask
from flask_security import Security
from BrandBridge_V2.models import db, User, Role
from config import DevelopmentConfig
from BrandBridge_V2.resources import api
from BrandBridge_V2.sec import datastore

def create_app():
    app = Flask(__name__)
    app.config.from_object(DevelopmentConfig)
    db.init_app(app)
    api.init_app(app)
    app.security = Security(app, datastore )
    with app.app_context():
        import BrandBridge_V2.views

    return app


app = create_app()
if __name__ == '__main__':
    app.run(debug=True)