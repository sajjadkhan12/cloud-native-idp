# S3 bucket provisioned via Backstage
# Bucket Name: ${{ values.bucket_name }}

module "bucket_${{ values.bucket_name | replace('-', '_') }}" {
  source = "./modules/s3-bucket"

  name              = "${{ values.bucket_name }}"
  region            = "${{ values.aws_region }}"
  enable_versioning = ${{ values.enable_versioning }}

  tags = {
    managed_by  = "backstage"
    environment = "${{ values.environment }}"
  }
}
