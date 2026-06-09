# AWS Deployment (Your Account)

Terraform for PostWave AWS resources.

## What is implemented today

| Resource | Status |
|----------|--------|
| S3 uploads bucket | **Implemented** (`main.tf`) |
| RDS PostgreSQL | Planned |
| ElastiCache Redis | Planned |
| ECS Fargate (web + worker) | Planned |

## Quick start (S3 only)

```bash
cd infra/deploy/aws
cp terraform.tfvars.example terraform.tfvars
# Set s3_bucket_name to a globally unique name

terraform init
terraform plan
terraform apply
```

After apply, set on your web service:

```
STORAGE_TYPE=s3
S3_BUCKET=<output s3_bucket>
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_PUBLIC_URL=https://your-bucket.s3.amazonaws.com
```

Pair with Postgres (Neon/RDS) and Redis (Upstash/ElastiCache) per [docs/DEPLOYMENT.md](../../../docs/DEPLOYMENT.md).

## Cost warning

You pay for all AWS resources. Use `terraform destroy` to tear down when not needed.
