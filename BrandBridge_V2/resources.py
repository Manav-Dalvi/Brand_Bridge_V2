from flask_restful import Resource, Api, reqparse, marshal_with, fields
from .models import Campaign, db
from datetime import datetime


api = Api(prefix='/api')

campaign_parser = reqparse.RequestParser()
campaign_parser.add_argument('title', type=str, help='Title should be a string', required=True)
campaign_parser.add_argument('desc', type=str, help='Description should be a string', required=True)
campaign_parser.add_argument('start_date', type=str, help='Start Date should be a string', required=True)
campaign_parser.add_argument('end_date', type=str, help='End Date should be a string', required=True)
campaign_parser.add_argument('budget', type=int, help='Budget should be an integer', required=True)
campaign_parser.add_argument('goals', type=str, help='Goals should be a string', required=True)
campaign_parser.add_argument('sponsor_id', type=int, help='Sponsor ID should be an integer', required=True)


campaign_fields = {
    'id': fields.Integer,
    'title': fields.String,
    'desc': fields.String,
    'start_date': fields.String,
    'end_date': fields.String,
    'budget': fields.Integer,
    'goals': fields.String,
    'sponsor_id': fields.Integer,
    'owner': fields.Nested({
        'id': fields.Integer,
        'company_name': fields.String,
        'image_file': fields.String
    }),
    'date_posted': fields.String
}



class CampaignResource(Resource):
    @marshal_with(campaign_fields)
    def get(self):
        try:
            campaigns = Campaign.query.order_by(Campaign.date_posted.desc()).all()
            return campaigns
        except Exception as e:
            print(f"Exception: {e}")  # Debug print
            return {"message": "Internal Server Error"}, 500

    def post(self):
        args = campaign_parser.parse_args()
        try:
        
            start_date = datetime.strptime(args['start_date'], '%Y-%m-%d')
            end_date = datetime.strptime(args['end_date'], '%Y-%m-%d')
        except ValueError:
            return {"message": "Invalid date format. Use YYYY-MM-DD."}, 400
        
        campaign = Campaign(
            title=args['title'],
            desc=args['desc'],
            start_date=start_date,
            end_date=end_date,
            budget=args['budget'],
            goals=args['goals'],
            sponsor_id=args['sponsor_id'])
        
        db.session.add(campaign)
        db.session.commit()
        return {"message": "Campaign Created"}

api.add_resource(CampaignResource, '/campaigns')
