// client/lib/authConfig.ts
export const msalConfig = {
  auth: {
    clientId: "cce978b1-15d7-48f3-a3b7-33a58c197db1", // 剛才領到的 ID
    authority: "https://login.microsoftonline.com/common", // common 代表允許所有公司帳號
    redirectUri: typeof window !== "undefined" ? window.location.origin : "",
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: "sessionStorage", 
    storeAuthStateInCookie: false,
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