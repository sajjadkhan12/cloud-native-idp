# S3 bucket provisioned via Backstage
# Bucket Name: ${{ values.bucket_name }}
# Team: ${{ values.team_id }}
# Region: ${{ values.aws_region }}

module "bucket_${{ values.bucket_name | replace('-', '_') }}" {
  source = "github.com/sajjadkhan-academy/backstage-terraform//modules/s3-bucket?ref=v1.0.0"

  name              = "${{ values.bucket_name }}"
  region            = "${{ values.aws_region }}"
  enable_versioning = ${{ values.enable_versioning }}

  tags = {
    managed_by  = "backstage"
    team        = "${{ values.team_id }}"
    environment = "${{ values.environment }}"
  }
}
