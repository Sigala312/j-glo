// client/lib/authConfig.ts
export const msalConfig = {
  auth: {
    clientId: "cce978b1-15d7-48f3-a3b7-33a58c197db1", 
    authority: "https://login.microsoftonline.com/common", 
redirectUri: process.env.NODE_ENV === 'production' 
      ? "https://j-glo-client.vercel.app" 
      : "http://localhost:3000",     
      navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: "localStorage", 
    storeAuthStateInCookie: true,
  },
  system: {
    allowRedirectInIframe: true,
  }
};

// 要求的權限範例
export const loginRequest = {
  scopes: ["User.Read"],
  prompt: "select_account",
};