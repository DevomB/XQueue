terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "project_name" {
  type    = string
  default = "postwave"
}

variable "db_password" {
  type      = string
  sensitive = true
}

# Set a globally unique bucket name in terraform.tfvars
variable "s3_bucket_name" {
  type        = string
  description = "Globally unique S3 bucket name for uploads"
}

resource "aws_s3_bucket" "uploads" {
  bucket = var.s3_bucket_name
}

resource "aws_s3_bucket_public_access_block" "uploads" {
  bucket                  = aws_s3_bucket.uploads.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Extend with VPC, RDS, ElastiCache, ECS — see README.md

output "s3_bucket" {
  value = aws_s3_bucket.uploads.bucket
}

output "next_steps" {
  value = "Add RDS, Redis, ECS. Set STORAGE_TYPE=s3 and S3_* env vars on web service."
}
