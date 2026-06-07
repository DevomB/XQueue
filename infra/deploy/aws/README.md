# AWS Deployment (Your Account)

Deploy PostWave into **your own AWS account** using Terraform.

## What gets created

- VPC with public subnets
- RDS PostgreSQL (db.t3.micro)
- ElastiCache Redis (cache.t3.micro)
- S3 bucket for image uploads
- ECS Fargate cluster with web + worker services

## Prerequisites

- AWS CLI configured (`aws configure`)
- Terraform 1.5+
- Docker (for building images)

## Quick start

```bash
cd infra/deploy/aws
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values

terraform init
terraform plan
terraform apply
```

## After apply

1. Note outputs: `database_url`, `redis_url`, `s3_bucket`, `web_url`
2. Set secrets in AWS Secrets Manager (see `variables.tf`)
3. Build and push Docker images to ECR (see `ecs.tf` outputs)
4. Update X Developer Console callback URL to your web URL

## Cost warning

You pay for all AWS resources. Use `terraform destroy` to tear down when not needed.

## Liability

This deploys to **your** AWS account. You are responsible for costs, security, and compliance. See [DISCLAIMER.md](../../../DISCLAIMER.md).
