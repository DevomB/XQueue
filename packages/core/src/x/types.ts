export type XTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type?: string;
  scope?: string;
};

export type XUserResponse = {
  data: {
    id: string;
    username: string;
    name: string;
  };
};
