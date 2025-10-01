# Workshop Registration System

> A modern, serverless workshop management platform for conferences and community events

Originally built for AWS Community Day CEE, this system enables seamless workshop registration with real-time capacity tracking, attendee self-service, and administrative controls.

---

## ✨ What It Does

**Attendee Experience**
- Browse workshops with live availability updates
- Secure login with conference ticket ID
- Instant registration and cancellation
- Rate workshops after attending

**Admin Capabilities**
- Manage workshop capacity and no-shows
- View attendee ratings and feedback
- Workshop-specific or global admin access
- Real-time registration monitoring

---

## 🏗️ Technology Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React SPA |
| Hosting | Amazon S3 + CloudFront (optional) |
| API | Amazon API Gateway |
| Functions | AWS Lambda (Node.js 22.x) |
| Database | Amazon DynamoDB |
| IaC | AWS CloudFormation |

**100% serverless** • Pay only for what you use • Auto-scaling built-in

---

## 📁 Repository Structure

```
workshop-registration/
│
├── frontend/              # React application
│   ├── src/              # Source code
│   ├── public/           # Static assets
│   ├── package.json      # Dependencies
│   ├── package-lock.json
│   └── README.md
│
├── lambda/               # Lambda deployment packages
│   ├── auth.zip         # Authentication function
│   ├── workshops.zip    # Workshop management
│   ├── registrations.zip # Registration operations
│   ├── admin.zip        # Admin functions
│   └── ratings.zip      # Rating system
│
└── template.yaml        # CloudFormation template
```

---

## 💾 Database Schema

### Core Tables

#### **Workshops**
Workshop catalog with capacity limits
```javascript
{
  id: "WRK001",                    // Primary key
  title: "Building Production-Ready AI Systems...",
  abstract: "Transform your AI development...",
  speakers: ["Andra Somesan", "Radu Dobrinescu"],
  time: "10:00 - 11:30",
  location: "Hajó",
  maxCapacity: 26
}
```

#### **ValidTickets**
Authorized attendee registry
```javascript
{
  ticketId: "123456",             // Primary key
  firstName: "Radu",
  lastName: "Dobrinescu",
  isValid: true
}
```

#### **Registrations**
Active workshop registrations
- **Composite Key**: `ticketId` (HASH) + `workshopId` (RANGE)
- **GSI**: `workshopId-index` for querying by workshop

#### **Ratings**
Post-workshop feedback
- **Composite Key**: `ticketId` (HASH) + `workshopId` (RANGE)
- **GSI**: `workshopId-index` for aggregating ratings

#### **AdminPermissions**
Access control for administrators
```javascript
{
  ticketId: "123456",  // Admin's ticket ID
  workshopId: "WRK001"                     // "*" for all workshops
}
```

---

## 🚀 Quick Start

### Prerequisites

- AWS CLI configured with appropriate credentials
- AWS account with permissions to create resources
- S3 bucket for Lambda deployment packages
- Node.js and npm installed (for frontend build)

### Step 1: Upload Lambda Functions

The Lambda functions are already packaged as zip files. Upload them to S3:

```bash
# Upload all Lambda zip files to your S3 bucket
aws s3 cp lambda/auth.zip s3://YOUR-BUCKET/lambda/auth.zip
aws s3 cp lambda/workshops.zip s3://YOUR-BUCKET/lambda/workshops.zip
aws s3 cp lambda/registrations.zip s3://YOUR-BUCKET/lambda/registrations.zip
aws s3 cp lambda/admin.zip s3://YOUR-BUCKET/lambda/admin.zip
aws s3 cp lambda/ratings.zip s3://YOUR-BUCKET/lambda/ratings.zip
```

### Step 2: Deploy Infrastructure

```bash
aws cloudformation deploy \
  --stack-name workshop-registration \
  --template-file template.yaml \
  --parameter-overrides \
      LambdaCodeBucket=YOUR-BUCKET \
      DomainName=https://workshops.example.com \
  --capabilities CAPABILITY_IAM
```

**Note**: Replace `YOUR-BUCKET` with your S3 bucket name and `workshops.example.com` with your actual domain.

### Step 3: Retrieve API Endpoint

```bash
aws cloudformation describe-stacks \
  --stack-name workshop-registration \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
  --output text
```

Save this URL - you'll need it for the frontend configuration.

---

## 🎨 Frontend Setup

### Build the React Application

```bash
cd frontend

# Install dependencies
npm install

# Configure API endpoint
# Create or edit .env file with your API Gateway URL
cat > .env << EOF
REACT_APP_API_GATEWAY_INVOKE_URL=https://abc123def4.execute-api.eu-central-1.amazonaws.com/prod
EOF
```

**Important**: Replace the URL with your actual API Gateway endpoint from Step 3.

```bash
# Build for production
npm run build
```

The build process creates an optimized production bundle in the `build/` directory.

### Deploy to S3

#### Option 1: Basic Static Website Hosting (HTTP)

```bash
# Set your bucket name
BUCKET_NAME=your-workshop-frontend

# Create S3 bucket
aws s3 mb s3://$BUCKET_NAME

# Configure as static website
aws s3 website s3://$BUCKET_NAME \
  --index-document index.html \
  --error-document index.html

# Disable block public access
aws s3api put-public-access-block \
  --bucket $BUCKET_NAME \
  --public-access-block-configuration \
    BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false

# Create and apply bucket policy
cat > bucket-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
  }]
}
EOF

aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file://bucket-policy.json

# Deploy the build
aws s3 sync build/ s3://$BUCKET_NAME/ --delete

# Get your website URL
echo "Website URL: http://$BUCKET_NAME.s3-website-$(aws configure get region).amazonaws.com"
```

#### Option 2: Production Setup with CloudFront (HTTPS)

For HTTPS and custom domains, use CloudFront:

```bash
# Create CloudFront Origin Access Identity
OAI=$(aws cloudfront create-cloud-front-origin-access-identity \
  --cloud-front-origin-access-identity-config \
    CallerReference=$(date +%s),Comment="Workshop Registration OAI" \
  --query 'CloudFrontOriginAccessIdentity.Id' \
  --output text)

# Update bucket policy for CloudFront access (remove public access first)
aws s3api put-public-access-block \
  --bucket $BUCKET_NAME \
  --public-access-block-configuration \
    BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

cat > cf-bucket-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {
      "AWS": "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity $OAI"
    },
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
  }]
}
EOF

aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file://cf-bucket-policy.json

# Create CloudFront distribution
DISTRIBUTION_ID=$(aws cloudfront create-distribution \
  --distribution-config "{
    \"CallerReference\": \"$(date +%s)\",
    \"Comment\": \"Workshop Registration System\",
    \"DefaultRootObject\": \"index.html\",
    \"Origins\": {
      \"Quantity\": 1,
      \"Items\": [{
        \"Id\": \"S3-$BUCKET_NAME\",
        \"DomainName\": \"$BUCKET_NAME.s3.amazonaws.com\",
        \"S3OriginConfig\": {
          \"OriginAccessIdentity\": \"origin-access-identity/cloudfront/$OAI\"
        }
      }]
    },
    \"DefaultCacheBehavior\": {
      \"TargetOriginId\": \"S3-$BUCKET_NAME\",
      \"ViewerProtocolPolicy\": \"redirect-to-https\",
      \"AllowedMethods\": {
        \"Quantity\": 2,
        \"Items\": [\"GET\", \"HEAD\"]
      },
      \"ForwardedValues\": {
        \"QueryString\": false,
        \"Cookies\": {\"Forward\": \"none\"}
      },
      \"MinTTL\": 0,
      \"DefaultTTL\": 86400,
      \"MaxTTL\": 31536000,
      \"Compress\": true
    },
    \"CustomErrorResponses\": {
      \"Quantity\": 1,
      \"Items\": [{
        \"ErrorCode\": 404,
        \"ResponsePagePath\": \"/index.html\",
        \"ResponseCode\": \"200\",
        \"ErrorCachingMinTTL\": 300
      }]
    },
    \"Enabled\": true
  }" \
  --query 'Distribution.Id' \
  --output text)

# Get CloudFront domain
aws cloudfront get-distribution --id $DISTRIBUTION_ID \
  --query 'Distribution.DomainName' \
  --output text
```

**For custom domain and SSL**:
1. Request certificate in AWS Certificate Manager (ACM) in **us-east-1** region
2. Validate domain ownership
3. Update CloudFront distribution with certificate ARN and alternate domain name
4. Create Route 53 alias record pointing to CloudFront distribution

### Update CORS After Frontend Deployment

After deploying your frontend, update the CloudFormation stack with the correct domain:

```bash
# For S3 website
FRONTEND_URL="http://$BUCKET_NAME.s3-website-$(aws configure get region).amazonaws.com"

# Or for CloudFront
FRONTEND_URL="https://d1234567890.cloudfront.net"

# Update stack
aws cloudformation update-stack \
  --stack-name workshop-registration \
  --use-previous-template \
  --parameters \
    ParameterKey=LambdaCodeBucket,UsePreviousValue=true \
    ParameterKey=DomainName,ParameterValue=$FRONTEND_URL \
  --capabilities CAPABILITY_IAM
```

---

## 🔌 API Reference

### Authentication
```http
POST /auth/login
Content-Type: application/json

{ "ticketId": "123456" }
```

### Workshops
```http
GET /workshops
# Returns all workshops with current registration counts
```

### Registrations
```http
# Register for workshop
POST /registrations
{ "ticketId": "123456", "workshopId": "WRK001" }

# View my registrations
GET /registrations/{ticketId}

# Cancel registration
DELETE /registrations/{ticketId}/{workshopId}
```

### Ratings
```http
# Submit rating
POST /ratings
{ "ticketId": "123456", "workshopId": "WRK001", "rating": 5, "comment": "Great!" }

# View my ratings
GET /ratings/{ticketId}
```

### Admin Operations
```http
# View workshop registrations (requires admin permission)
GET /admin/registrations?workshopId=WRK001

# Remove attendee (no-show management)
DELETE /admin/registrations/{ticketId}/{workshopId}

# View ratings for workshop
GET /admin/ratings/{workshopId}
```

---

## 🔧 Configuration

### Frontend Environment Variables

The React application uses environment variables configured in `.env`:

```bash
REACT_APP_API_GATEWAY_INVOKE_URL=https://abc123def4.execute-api.eu-central-1.amazonaws.com/prod
```

**Note**: After changing `.env`, you must rebuild the application (`npm run build`) for changes to take effect.

### Lambda Environment Variables

Lambda functions use these environment variables (configured via CloudFormation):

| Variable | Description |
|----------|-------------|
| `ALLOWED_ORIGINS` | CORS whitelist (frontend URL) |
| `WORKSHOPS_TABLE` | DynamoDB table name |
| `REGISTRATIONS_TABLE` | DynamoDB table name |
| `VALID_TICKETS_TABLE` | DynamoDB table name |
| `ADMIN_PERMISSIONS_TABLE` | DynamoDB table name |
| `RATINGS_TABLE` | DynamoDB table name |

---

## 🔒 Security Notes

- **Authentication**: Ticket IDs act as bearer tokens
- **CORS**: Strictly enforced to prevent unauthorized origins
- **Admin Access**: Granular permissions per workshop or global
- **Rate Limiting**: Consider API Gateway throttling in production
- **WAF**: Recommended for public-facing deployments

---

## 📊 Cost Estimate

For a conference with 500 attendees and 20 workshops:

| Service | Monthly Cost |
|---------|--------------|
| DynamoDB (on-demand) | ~$2-5 |
| Lambda (1M requests) | ~$0.20 |
| API Gateway (1M requests) | ~$3.50 |
| S3 Hosting | ~$0.50 |
| CloudFront (optional) | ~$1-10 |
| **Total** | **~$7-20/month** |

*Actual costs scale with usage. Most conferences will stay in AWS Free Tier.*

---

## 🤝 Contributing

We welcome contributions from the community!

- 🐛 **Bug Reports**: Open an issue with reproduction steps
- 💡 **Feature Requests**: Share your ideas in discussions
- 🔧 **Pull Requests**: Fork, branch, and submit PRs
- 📖 **Documentation**: Help improve these docs

---

## 📜 License

MIT License - Free to use for your conference or event!

See [LICENSE](LICENSE) file for details.

---

## 🎯 Use Cases

This system can be used for:
- ✅ AWS Community Days
- ✅ Technical workshops at meetups
- ✅ Conference breakout sessions
- ✅ Training session management
- ✅ Hackathon track selection

**Running your own event?** I'd love to hear about it! Share your story in the [Discussions](https://github.com/suhajda3/workshop-registration/discussions).

---

## 💬 Support

- 📚 Check the [Issues](https://github.com/suhajda3/workshop-registration/issues) for known problems
- 💡 Join [Discussions](https://github.com/suhajda3/workshop-registration/discussions) for questions
- 🐦 Connect with [@mihalybalassy](https://www.linkedin.com/in/mihalybalassy/)

Built with ❤️ for the community by Mihaly Balassy.