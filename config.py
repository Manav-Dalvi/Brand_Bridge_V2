class Config(object):
    DEBUG = False
    TESTING = False


class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///site.db'
    SECRET_KEY = "IESCPV2_MAD2_DB"
    SECURITY_PASSWORD_SALT = "PASSWORDSALT"
    SECURITY_PASSWORD_HASH = 'pbkdf2_sha512'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    WTF_CSRF_ENABLED = False #Ensures the request is coming from legitimate token
    SECURITY_TOKEN_AUTHENTICATION_HEADER = "Authentication-Token"


