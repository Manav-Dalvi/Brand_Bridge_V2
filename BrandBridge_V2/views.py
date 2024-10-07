from flask import current_app as app, jsonify, request, render_template, abort, flash
from flask_security import auth_required, roles_required
from .models import User, db, Sponsor, Influencer, Campaign, AdRequest
from BrandBridge_V2.sec import datastore
from datetime import datetime
from werkzeug.security import check_password_hash, generate_password_hash


@app.get('/')
@app.get('/home')
def home():
    return render_template("index.html")

@app.get('/admin')
@auth_required("token")
@roles_required("admin")
def admin():
    return "Welcome Admin"


@app.post('/user-login')
def user_login():
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({"message": "email not provided"}), 400

    user = datastore.find_user(email=email)

    if not user:
        return jsonify({"message": "User Not Found. Please try again."}), 404

    if check_password_hash(user.password, data.get("password")):
        return jsonify({"token": user.get_auth_token(), "email": user.email, "role": user.roles[0].name, "user_id": user.id})
    else:
        return jsonify({"message": "Incorrect Password. Please try again."}), 400
    

import re

def is_valid_email(email):
    email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    return re.match(email_regex, email)

@app.post('/user-register')
def user_register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')

    if not email or not password or not role:
        return jsonify({"message": "Please fill all the required fields"}), 400

    if not is_valid_email(email):
        return jsonify({"message": "Invalid email address"}), 400

    if datastore.find_user(email=email):
        return jsonify({"message": "User already exists"}), 400

    # Depending on the role, create the appropriate user
    if role == 'admin':
        user = datastore.create_user(email=email, password=generate_password_hash(password), roles=[datastore.find_or_create_role(name="admin")])
    elif role == 'sponsor':
        company_name = data.get('company_name')
        industry = data.get('industry')
        budget = data.get('budget')
        user = Sponsor(email=email, password=generate_password_hash(password), company_name=company_name, industry=industry, budget=budget, roles=[datastore.find_or_create_role(name="sponsor")])
    elif role == 'influencer':
        name = data.get('name')
        niche = data.get('niche')
        reach = data.get('reach')
        user = Influencer(email=email, password=generate_password_hash(password), name=name, niche=niche, reach=reach, roles=[datastore.find_or_create_role(name="influencer")])
    else:
        return jsonify({"message": "Invalid role selected"}), 400

    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "Registration successful"}), 201


@app.post('/new-campaign')
@roles_required("sponsor")
def new_campaign():
    # Extract data from the request
    data = request.get_json()
    
    # Check if the data is valid
    required_fields = ['title', 'desc', 'start_date', 'end_date', 'budget', 'goals']
    for field in required_fields:
        if field not in data:
            return jsonify({"message": f"Missing field: {field}"}), 400
    
    # Validate sponsor_id
    sponsor_id = data.get('sponsor_id')
    if not sponsor_id:
        return jsonify({"message": "Sponsor ID is required"}), 400
    
    start_date = datetime.strptime(data['start_date'], '%Y-%m-%d')
    end_date = datetime.strptime(data['end_date'], '%Y-%m-%d')
    
    # Create a new campaign
    try:
        campaign = Campaign(
            title=data['title'],
            desc=data['desc'],
            start_date=start_date,
            end_date=end_date,
            budget=data['budget'],
            goals=data['goals'],
            sponsor_id=sponsor_id
        )
        db.session.add(campaign)
        db.session.commit()
        flash('Campaign created successfully!', 'success')
        return jsonify({"message": "Campaign created successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 500


@app.route('/api/sponsor_campaigns/<int:sponsor_id>')
def sponsor_campaigns(sponsor_id):
    sponsor = Sponsor.query.get_or_404(sponsor_id)
    campaigns = Campaign.query.filter_by(sponsor_id=sponsor.id).order_by(Campaign.date_posted.desc()).all()
    data = {
        "sponsor": {
            "company_name": sponsor.company_name,
            "image_file": sponsor.image_file  # Assuming this field exists
        },
        "campaigns": [{
            "id": campaign.id,
            "title": campaign.title,
            "desc": campaign.desc,
            "date_posted": campaign.date_posted,
            "owner": {
                "company_name": campaign.owner.company_name,
                "image_file": campaign.owner.image_file
            }
        } for campaign in campaigns]
    }
    return jsonify(data)

@app.route('/api/user_info/<int:user_id>', methods=['GET'])
def dashboard(user_id):
    # Fetch user by ID
    user = User.query.get_or_404(user_id)  # Replace User with the appropriate model

    user_info = {
        "email": user.email
    }

    if user.is_sponsor():
        user_info.update({
            "id": user.id,
            "role": "sponsor",
            "company_name": user.company_name,
            "industry": user.industry,
            "budget": user.budget,
            "profile": user.image_file
        })
    elif user.is_influencer():
        user_info.update({
            "role": "influencer",
            "name": user.name,
            "niche": user.niche,
            "reach": user.reach,
            "total_earnings": user.total_earnings,
            "profile": user.image_file
        })
    else:
        user_info["role"] = "admin"

    return jsonify(user_info)

@app.route('/api/campaign/<int:campaign_id>')
def get_campaign(campaign_id):
    campaign = Campaign.query.get_or_404(campaign_id)
    data = {
        "id": campaign.id,
        "title": campaign.title,
        "desc": campaign.desc,
        "date_posted": campaign.date_posted.strftime('%Y-%m-%d'),
        "owner": {
            "id": campaign.owner.id,
            "company_name": campaign.owner.company_name,
            "image_file": campaign.owner.image_file
        },
        "start_date": campaign.start_date.strftime('%Y-%m-%d'),
        "end_date": campaign.end_date.strftime('%Y-%m-%d'),
        "budget": campaign.budget,
        "goals": campaign.goals
    }
    return jsonify(data)

@app.route('/api/campaigns/<int:campaign_id>', methods=['PUT'])
def update_campaign(campaign_id):
    # Extract data from the request
    data = request.get_json()
    
    # Check if the data is valid
    required_fields = ['title', 'desc', 'start_date', 'end_date', 'budget', 'goals']
    for field in required_fields:
        if field not in data:
            return jsonify({"message": f"Missing field: {field}"}), 400
    
    # Find the campaign and update
    campaign = Campaign.query.get_or_404(campaign_id)
    campaign.title = data['title']
    campaign.desc = data['desc']
    campaign.start_date = datetime.strptime(data['start_date'], '%Y-%m-%d')
    campaign.end_date = datetime.strptime(data['end_date'], '%Y-%m-%d')
    campaign.budget = data['budget']
    campaign.goals = data['goals']
    
    try:
        db.session.commit()
        flash('Campaign Updated successfully!', 'success')
        return jsonify({"message": "Campaign updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 500
    
@app.route('/api/campaigns/<int:campaign_id>', methods=['DELETE'])
def delete_campaign(campaign_id):
    # Fetch the campaign by ID
    campaign = Campaign.query.get(campaign_id)
    
    # Check if campaign exists
    if not campaign:
        abort(404, description="Campaign not found")
    
    try:
        # Delete the campaign
        AdRequest.query.filter_by(campaign_id=campaign_id).delete()
        db.session.delete(campaign)
        db.session.commit()
        return jsonify({"message": "Campaign deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting campaign: {e}")
        return jsonify({"error": "An error occurred while deleting the campaign"}), 500


@app.route('/api/user_info/<int:user_id>', methods=['PUT'])
def update_user_info(user_id):
    user = User.query.get_or_404(user_id)

    data = request.get_json()

    if 'name' in data:
        user.name = data['name']
    if 'email' in data:
        user.email = data['email']
    if 'niche' in data:
        user.niche = data['niche']
    if 'reach' in data:
        user.reach = data['reach']
    if 'industry' in data:
        user.industry = data['industry']
    if 'budget' in data:
        user.budget = data['budget']

    try:
        db.session.commit()
        return jsonify({"message": "User info updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 500
    

@app.route('/api/search', methods=['GET'])
def search():
    query = request.args.get('query', '').lower()

    influencers = Influencer.query.filter(Influencer.name.ilike(f'%{query}%')).all()
    sponsors = Sponsor.query.filter(Sponsor.company_name.ilike(f'%{query}%')).all()
    campaigns = Campaign.query.filter(Campaign.title.ilike(f'%{query}%')).all()

    results = {
        'influencers': [{'id': inf.id, 'name': inf.name} for inf in influencers],
        'sponsors': [{'id': sp.id, 'company_name': sp.company_name} for sp in sponsors],
        'campaigns': [{'id': cp.id, 'title': cp.title} for cp in campaigns]
    }
    return jsonify(results)


@app.route('/api/influencer/<int:user_id>', methods=['GET'])
def get_influencer(user_id):
    # Fetch user by ID
    user = User.query.get_or_404(user_id)  # Replace User with the appropriate model

    user_info = {
        "email": user.email
    }
    if user.is_influencer():
        user_info.update({
            "role": "influencer",
            "name": user.name,
            "niche": user.niche,
            "reach": user.reach,
            "total_earnings": 0,
            "profile": user.image_file
        })
    else:
        user_info["role"] = "admin"

    return jsonify(user_info)

@app.route('/api/ad_request/<int:campaign_id>', methods=['POST'])
def create_ad_request(campaign_id):
    data = request.json
    influencer_id = data.get('influencer_id')  # Passed from the front-end

    if not influencer_id:
        return jsonify({'error': 'Influencer ID is required'}), 400

    ad_request = AdRequest(
        campaign_id=campaign_id,
        influencer_id=influencer_id,
        messages=data['messages'],
        requirements=data['requirements'],
        payment_amount=data['payment_amount']
    )
    db.session.add(ad_request)
    db.session.commit()
    
    return jsonify({'message': 'Ad request created successfully'}), 201


@app.route('/api/ad_requests/<int:campaign_id>', methods=['GET'])
def get_ad_requests(campaign_id):
    ad_requests = AdRequest.query.filter_by(campaign_id=campaign_id).all()
    if not ad_requests:
        return jsonify({'message': 'No ad requests found'})

    return jsonify([{
        'id': req.id,  # Include ID in the response
        'influencer_name': req.influencer.name,
        'status': req.status,
        'messages': req.messages,
        'payment_amount': req.payment_amount
    } for req in ad_requests]), 200

@app.route('/api/ad_requests/sponsor/<int:sponsor_id>', methods=['GET'])
def get_ad_requests_sponsor(sponsor_id):
    campaigns = Campaign.query.filter_by(sponsor_id=sponsor_id).all()
    if not campaigns:
        return jsonify({'message': 'No campaigns found for this sponsor'})

    ad_requests = []
    for campaign in campaigns:
        requests = AdRequest.query.filter_by(campaign_id=campaign.id).all()
        ad_requests.extend(requests)

    if not ad_requests:
        return jsonify({'message': 'No ad requests found'}), 404

    return jsonify([{
        'id': req.id,  # Include ID in the response
        'influencer_name': req.influencer.name,
        'status': req.status,
        'messages': req.messages,
        'payment_amount': req.payment_amount,
        'campaign': {
            'id': req.campaign.id,
            'title': req.campaign.title,
            'desc': req.campaign.desc,
            'goals': req.campaign.goals} 
    } for req in ad_requests]), 200


@app.route('/api/ad_requests/influencer/<int:influencer_id>', methods=['GET'])
def get_ad_requests_inf(influencer_id):
    ad_requests = AdRequest.query.filter_by(influencer_id=influencer_id).all()
    if not ad_requests:
        return jsonify({'message': 'No ad requests found'})

    return jsonify([{
        'id': req.id,  # Include ID in the response
        'influencer_name': req.influencer.name,
        'status': req.status,
        'messages': req.messages,
        'payment_amount': req.payment_amount,
        'campaign': {
            'id': req.campaign.id,
            'title': req.campaign.title,
            'desc': req.campaign.desc,
            'goals': req.campaign.goals} 
        }for req in ad_requests]), 200

@app.route('/api/ad_requests/influencer_prof/<int:influencer_id>', methods=['GET'])
def get_ad_requests_inf_prof(influencer_id):
    ad_requests = AdRequest.query.filter_by(influencer_id=influencer_id).all()
    ad_requests = AdRequest.query.filter_by(status="Accepted").all()

    
    if not ad_requests:
        return jsonify({'message': 'No ad requests found', 'ad_requests': []}), 200

    return jsonify([{
        'id': req.id,
        'influencer_name': req.influencer.name,
        'status': req.status,
        'messages': req.messages,
        'payment_amount': req.payment_amount,
        'campaign': {
            'id': req.campaign.id,
            'title': req.campaign.title,
            'desc': req.campaign.desc,
            'goals': req.campaign.goals
            # Add any other campaign fields you need here
        }
    } for req in ad_requests]), 200


@app.route('/api/ad_request/<int:ad_request_id>/accept', methods=['POST'])
def accept_ad_request(ad_request_id):
    ad_request = AdRequest.query.get_or_404(ad_request_id)
    if ad_request.status != 'Pending':
        return jsonify({'message': 'Ad request is not pending'}), 400
    
    ad_request.status = 'Accepted'
    influencer = Influencer.query.get_or_404(ad_request.influencer_id)
    influencer.total_earnings += ad_request.payment_amount
    db.session.commit()

    return jsonify({'message': 'Ad request accepted'}), 200


@app.route('/api/ad_request/<int:ad_request_id>/reject', methods=['POST'])
def reject_ad_request(ad_request_id):
    ad_request = AdRequest.query.get_or_404(ad_request_id)
    if ad_request.status != 'Pending':
        return jsonify({'message': 'Ad request is not pending'}), 400
    
    ad_request.status = 'Rejected'
    db.session.commit()
    return jsonify({'message': 'Ad request rejected'}), 200


@app.route('/api/influencers', methods=['GET'])
def get_influencers():
    influencers = Influencer.query.all()
    serialized_influencers = [
        {
            'id': influencer.id,
            'name': influencer.name,
            'niche': influencer.niche,
            'reach': influencer.reach,
            'image_file': influencer.image_file
        } for influencer in influencers
    ]
    return jsonify(serialized_influencers)

@app.route('/api/sponsors', methods=['GET'])
def get_sponsors():
    sponsors = Sponsor.query.all()
    serialized_sponsors = [
        {
            'id': sponsor.id,
            'company_name': sponsor.company_name,
            'industry': sponsor.industry,
            'budget': sponsor.budget,
            'image_file': sponsor.image_file
        } for sponsor in sponsors
    ]
    return jsonify(serialized_sponsors)


@app.route('/api/campaigns', methods=['GET'])
def get_campaigns():
    campaigns = Campaign.query.all()  # Assuming 'Campaign' is your model
    if not campaigns:
        return jsonify({'message': 'No campaigns found'}), 404

    return jsonify([{
        'id': campaign.id,
        'title': campaign.title,
        'desc': campaign.desc,
        'date_posted': campaign.date_posted,
        'owner': {
            'company_name': campaign.owner.company_name,
            'image_file': campaign.owner.image_file
        }
    } for campaign in campaigns]), 200

@app.route('/api/influencers/<int:influencer_id>', methods=['DELETE'])
def delete_influencer(influencer_id):
    influencer = Influencer.query.get(influencer_id)
    # Delete associated ad_requests
    AdRequest.query.filter_by(influencer_id=influencer_id).delete()
    db.session.delete(influencer)
    db.session.commit()
    return jsonify({'message': 'Influencer deleted successfully'}), 200

@app.route('/api/sponsors/<int:sponsor_id>', methods=['DELETE'])
def delete_sponsor(sponsor_id):
    sponsor = Sponsor.query.get(sponsor_id)
    campaigns = Campaign.query.filter_by(sponsor_id=sponsor_id).all()
    for campaign in campaigns:
        # Delete associated ad_requests
        AdRequest.query.filter_by(campaign_id=campaign.id).delete()
        # Delete the campaign
        db.session.delete(campaign)
    db.session.delete(sponsor)
    db.session.commit()
    return jsonify({'message': 'Sponsor deleted successfully'}), 200

@app.route('/api/campaigns/<int:campaign_id>', methods=['DELETE'])
def delete_campaign_admin(campaign_id):
    campaign = Campaign.query.get(campaign_id)
    AdRequest.query.filter_by(campaign_id=campaign_id).delete()
    db.session.delete(campaign)
    db.session.commit()
    return jsonify({'message': 'Campaign deleted successfully'}), 200


