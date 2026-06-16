export interface WompiPresignedToken {
  acceptance_token: string;
  permalink: string;
  type: string;
}

export interface WompiMerchantData {
  id: number;
  name: string;
  public_key: string;
  presigned_acceptance: WompiPresignedToken;
  presigned_personal_data_auth: WompiPresignedToken;
}
