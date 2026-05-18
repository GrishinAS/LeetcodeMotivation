#!/usr/bin/env bash
# Builds the Lambda ZIP, uploads to S3, and deploys (or updates) the CloudFormation stack.
#
# Required environment variables:
#   JWT_SECRET        — min 32 characters, used to sign JWTs
#   ALERT_EMAIL       — email address for budget alert notifications
#   DB_URL            — JDBC URL for Google Cloud SQL, e.g. jdbc:postgresql://<ip>:5432/<db>?ssl=true&sslmode=require
#   DB_USERNAME       — PostgreSQL username
#   DB_PASSWORD       — PostgreSQL password
#
# Optional:
#   AWS_REGION                  — defaults to us-east-1
#   CORS_ALLOWED_ORIGINS        — defaults to https://leetcode-motivation.vercel.app
#   MONTHLY_BUDGET_USD          — defaults to 1 (USD)
#   LAMBDA_RESERVED_CONCURRENCY — defaults to 0 (no reservation); set to e.g. 3 once account limit is raised
#   STACK_NAME                  — defaults to leetcode-motivation

set -euo pipefail

STACK_NAME="${STACK_NAME:-leetcode-motivation}"
REGION="${AWS_REGION:-us-east-1}"
ZIP_FILE="backend/build/distributions/app-lambda.zip"
GIT_HASH=$(git rev-parse --short HEAD 2>/dev/null || date +%s)
S3_KEY="app-lambda-${GIT_HASH}.zip"

: "${JWT_SECRET:?JWT_SECRET env var is required (min 32 characters)}"
: "${ALERT_EMAIL:?ALERT_EMAIL env var is required}"
: "${DB_URL:?DB_URL env var is required (Google Cloud SQL JDBC URL)}"
: "${DB_USERNAME:?DB_USERNAME env var is required}"
: "${DB_PASSWORD:?DB_PASSWORD env var is required}"

# ── 1. Build ──────────────────────────────────────────────────────────────────
echo "==> Building Lambda ZIP..."
(cd backend && ./gradlew buildZip --info)

if [ ! -f "$ZIP_FILE" ]; then
  echo "ERROR: Build output not found at $ZIP_FILE"
  exit 1
fi

ZIP_SIZE=$(du -sh "$ZIP_FILE" | cut -f1)
echo "    ZIP size: $ZIP_SIZE"

# ── 2. S3 bucket (one-time setup) ────────────────────────────────────────────
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text --region "$REGION")
BUCKET_NAME="${STACK_NAME}-lambda-${ACCOUNT_ID}"

echo "==> Ensuring S3 bucket '$BUCKET_NAME' exists..."
if ! aws s3api head-bucket --bucket "$BUCKET_NAME" --region "$REGION" 2>/dev/null; then
  aws s3 mb "s3://${BUCKET_NAME}" --region "$REGION"
  # Block all public access
  aws s3api put-public-access-block \
    --bucket "$BUCKET_NAME" \
    --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true" \
    --region "$REGION"
  echo "    Bucket created."
fi

# ── 3. Upload ZIP ─────────────────────────────────────────────────────────────
echo "==> Uploading Lambda package to s3://${BUCKET_NAME}/${S3_KEY} ..."
aws s3 cp "$ZIP_FILE" "s3://${BUCKET_NAME}/${S3_KEY}" --region "$REGION"

# ── 4. Deploy CloudFormation ──────────────────────────────────────────────────
echo "==> Deploying CloudFormation stack '$STACK_NAME'..."
aws cloudformation deploy \
  --template-file "$(dirname "$0")/cloudformation.yml" \
  --stack-name "$STACK_NAME" \
  --parameter-overrides \
    S3BucketName="$BUCKET_NAME" \
    S3Key="$S3_KEY" \
    JwtSecret="$JWT_SECRET" \
    CorsAllowedOrigins="${CORS_ALLOWED_ORIGINS:-https://leetcode-motivation.vercel.app}" \
    AlertEmail="$ALERT_EMAIL" \
    MonthlyBudgetLimitUsd="${MONTHLY_BUDGET_USD:-1}" \
    LambdaReservedConcurrency="${LAMBDA_RESERVED_CONCURRENCY:-0}" \
    DbUrl="$DB_URL" \
    DbUsername="$DB_USERNAME" \
    DbPassword="$DB_PASSWORD" \
  --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
  --region "$REGION" \
  --no-fail-on-empty-changeset

# ── 5. Print outputs ──────────────────────────────────────────────────────────
echo ""
echo "==> Deployment complete! Stack outputs:"
aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --query "Stacks[0].Outputs" \
  --output table \
  --region "$REGION"

echo ""
echo "Next steps:"
echo "  1. Confirm the budget alert email subscription (check your inbox for '$ALERT_EMAIL')"
echo "  2. Set REACT_APP_API_HOST in your Vercel project to the ApiUrl shown above"
echo ""
echo "To re-enable Lambda after a budget shutdown:"
echo "  aws lambda put-function-concurrency \\"
echo "    --function-name ${STACK_NAME}-app \\"
echo "    --reserved-concurrent-executions 3 \\"
echo "    --region $REGION"
